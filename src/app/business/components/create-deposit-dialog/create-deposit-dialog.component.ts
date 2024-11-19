import {Component, OnInit} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {DepositService} from "../../services/deposit.service";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-create-deposit-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatInput,
    FormsModule,
    MatButton,
    MatDialogActions,
    MatLabel,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgIf,
    MatError,
    TranslatePipe
  ],
  templateUrl: './create-deposit-dialog.component.html',
  styleUrl: './create-deposit-dialog.component.css'
})
export class CreateDepositDialogComponent implements OnInit {
  depositForm: FormGroup;
  currentLanguage: string | undefined;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateDepositDialogComponent>,
    private depositService: DepositService,
    private translateService: TranslateService
  ) {
    this.depositForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
  }

  onDeposit(): void {
    if (this.depositForm.valid) {
      const amount = this.depositForm.get('amount')?.value;
      this.depositService.createDeposit(amount).subscribe(
        (data: any) => {
          const paymentWindow = window.open(data, 'Payment', 'width=800,height=800');
          if (paymentWindow) {
            const interval = setInterval(() => {
              if (paymentWindow.closed) {
                clearInterval(interval);
                location.reload();
              }
            }, 1000);
          }
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
