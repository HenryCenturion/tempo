import {Component, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {NgClass, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {Room} from "../../models/room.model";
import {RoomService} from "../../services/room.service";
import {
  MatCard, MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {ConfirmJoinRoomDialogComponent} from "../../components/confirm-join-room-dialog/confirm-join-room-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ErrorJoinRoomDialogComponent} from "../../components/error-join-room-dialog/error-join-room-dialog.component";
import { format, toZonedTime } from 'date-fns-tz';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {CreateRoomDialogComponent} from "../../components/create-room-dialog/create-room-dialog.component";
import confetti from "canvas-confetti";
import {ThemeService} from "../../../shared/services/theme.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics.service";


@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    NgForOf,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatCardImage,
    MatCardSubtitle,
    MatCardActions,
    MatButton,
    NgIf,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    MatInput,
    MatLabel,
    NgClass,
    TitleCasePipe,
    TranslatePipe
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  userData: any | undefined;
  filteredRooms: Room[] = [];
  isFilterMenuOpen = false;

  filter = {
    sportId: null,
    gamemode: '',
    district: '',
    minAmount: 0,
    maxAmount: 0
  };

  sports = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Billiards' }
  ];
  districts = [
    'San Miguel', 'San Borja', 'San Isidro', 'Surco', 'Magdalena', 'Pueblo Libre', 'Miraflores', 'Barranco', 'La Molina',
    'Jesus Maria', 'Lince', 'Chorrillos'
  ];
  gamemodes: string[] = [];
  isDarkMode: boolean = false;
  cooldown = false;
  lastShapeIndex = 0;
  currentLanguage: string | undefined;


  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private themeService: ThemeService,
    private translateService: TranslateService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    this.setCurrentTheme();
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
    });
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
    this.getUser();
    this.getAllRooms();
    this.updateGamemodes();
  }

  setCurrentTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    });
  }

  getAllRooms(): void {
    this.roomService.getAllRooms().subscribe(
      (data: any) => {
        this.rooms = data;
        this.rooms.forEach(room => {
          this.getPlayerList(room.id);
          this.setMaxPlayers(room);
        });
        this.applyFilters();
      },
      (error: any) => {
        console.error('Error fetching rooms', error);
      }
    );
  }

  applyFilters(): void {
    if (this.filter.sportId === 2) {
      this.filter.gamemode = 'BILLAR_3';
    }
    this.updateGamemodes();
    this.filteredRooms = this.rooms.filter(room => {
      return (!this.filter.sportId || room.sportSpace.sportId === this.filter.sportId) &&
        (!this.filter.gamemode || room.sportSpace.gamemode === this.filter.gamemode) &&
        (!this.filter.district || room.sportSpace.district === this.filter.district) &&
        (!this.filter.minAmount || room.sportSpace.amount >= this.filter.minAmount) &&
        (!this.filter.maxAmount || room.sportSpace.amount <= this.filter.maxAmount);
    });
  }

  clearFilters(): void {
    this.filter = {
      sportId: null,
      gamemode: '',
      district: '',
      minAmount: 0,
      maxAmount: 0
    };
    this.applyFilters();
  }

  getPlayerList(roomId: number): void {
    this.roomService.getPlayerList(roomId).subscribe(
      (playerList: any[]) => {
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
          room.isUserInRoom = this.isUserInRoom(playerList);
          room.playerLists = playerList;
        }
      },
      (error: any) => {
        console.error('Error fetching player list', error);
      }
    );
  }

  private getUserIdFromLocalStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  isUserInRoom(playerList: any[]): boolean {
    return playerList.some(player => player.userId === this.userData.id);
  }

  getUser(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.userData = data;
        }
      );
    }
  }

  getSportName(sportId: number): string {
    switch (sportId) {
      case 1:
        return 'Futbol';
      case 2:
        return 'Billar';
      default:
        return 'Unknown Sport';
    }
  }

  getSportGamemode(gamemode: string): string {
    switch (gamemode) {
      case "FUTBOL_5":
        return 'Futbol 5';
      case "FUTBOL_7":
        return 'Futbol 7';
      case "FUTBOL_8":
        return 'Futbol 8';
      case "FUTBOL_11":
        return 'Futbol 11';
      case "BILLAR_3":
        return 'Billar';
      default:
        return 'Unknown Gamemode';
    }
  }

  getMaxPlayers(room: Room): number {
    switch (room.sportSpace.gamemode) {
      case "FUTBOL_5":
        return 10;
      case "FUTBOL_7":
        return 14;
      case "FUTBOL_8":
        return 16;
      case "FUTBOL_11":
        return 22;
      case "BILLAR_3":
        return 3;
      default:
        return 0;
    }
  }

  setMaxPlayers(room: Room): number {
    switch (room.sportSpace.gamemode) {
      case "FUTBOL_5":
        return room.maxPlayers = 10;
      case "FUTBOL_7":
        return room.maxPlayers = 14;
      case "FUTBOL_8":
        return room.maxPlayers = 16;
      case "FUTBOL_11":
        return room.maxPlayers = 22;
      case "BILLAR_3":
        return room.maxPlayers = 3;
      default:
        return 0;
    }
  }

  joinRoom(roomId: number, amount: number): void {
    if (this.userData && this.userData.credits < amount) {
      this.dialog.open(ErrorJoinRoomDialogComponent, {
        width: '250px'
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmJoinRoomDialogComponent, {
      width: '250px',
      data: { amount }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.userData && this.userData.id) {
          this.roomService.joinPlayerList(this.userData.id, roomId).subscribe(
            (response: any) => {
              if (response.message === "Player added to room and chat successfully") {
                this.viewRoom(roomId);
                setTimeout(() => window.location.reload(), 600);
              }
            },
            (error: any) => {
              console.error('Error joining room', error);
            }
          );
        }
      }
    });
  }

  viewRoom(roomId: number): void {
    this.router.navigate(['/room-detail', roomId]);
  }

  formatDate(dateString: string): string {
    const timeZone = 'Etc/GMT-0';
    const zonedDate = toZonedTime(new Date(dateString), timeZone);
    return format(zonedDate, 'dd/MM/yyyy, HH:mm', { timeZone });
  }

  getRemainingPlayers(room: Room): number {
    return this.getMaxPlayers(room)- room.playerLists.length;
  }

  updateGamemodes(): void {
    if (this.filter.sportId === 1) {
      this.gamemodes = ['FUTBOL_11', 'FUTBOL_8', 'FUTBOL_7', 'FUTBOL_5'];
    } else if (this.filter.sportId === 2) {
      this.gamemodes = ['BILLAR_3'];
    } else {
      this.gamemodes = [];
    }
  }

  openCreateRoomDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllRooms();
        this.googleAnalyticsService.event('create_room', { event_category: 'engagement', event_label: 'Room Created' });
      }
    });
  }

  transformGamemode(gamemode: string): string {
    return gamemode.replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  celebrate() {
    let scalar = 3;
    let shapes = [
      confetti.shapeFromText({ text: '⚽', scalar }),
      confetti.shapeFromText({ text: '🎱', scalar })
    ];

    if (this.cooldown) {
      return;
    }

    this.cooldown = true;
    const duration = 6000;

    let randomShape = shapes[this.lastShapeIndex];
    this.lastShapeIndex = (this.lastShapeIndex + 1) % shapes.length;

    confetti({
      particleCount: 80,
      spread: 160,
      origin: { y: 0.37 },
      shapes: [randomShape],
      scalar
    });

    setTimeout(() => {
      confetti.reset();
      this.cooldown = false;
    }, duration);
  }
}
