/**
 * PrimengModule: agrupador de módulos de PrimeNG v17 para simplificar imports.
 * Importar en componentes standalone que necesiten múltiples componentes de PrimeNG.
 */
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

const PRIMENG_MODULES = [
  AccordionModule,
  AvatarModule,
  BadgeModule,
  ButtonModule,
  CardModule,
  CheckboxModule,
  ChipModule,
  ConfirmDialogModule,
  DataViewModule,
  DatePickerModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  FloatLabelModule,
  IconFieldModule,
  InputIconModule,
  InputGroupModule,
  InputGroupAddonModule,
  InputNumberModule,
  InputTextModule,
  MessageModule,
  MessagesModule,
  MultiSelectModule,
  PaginatorModule,
  PanelModule,
  PopoverModule,
  ProgressBarModule,
  ProgressSpinnerModule,
  RadioButtonModule,
  RippleModule,
  SelectButtonModule,
  SkeletonModule,
  SplitButtonModule,
  StepperModule,
  TableModule,
  TabsModule,
  TagModule,
  TextareaModule,
  ToastModule,
  ToggleSwitchModule,
  TooltipModule,
];

@NgModule({
  imports: PRIMENG_MODULES,
  exports: PRIMENG_MODULES,
})
export class PrimengModule {}
