import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxGaugeComponent } from "./gauge/gauge";
import {
  NgxGaugeLabel,
  NgxGaugeValue,
  NgxGaugePrepend,
  NgxGaugeAppend,
} from "./gauge/gauge-directives";

@NgModule({
  imports: [CommonModule],
  declarations: [
    NgxGaugeComponent,
    NgxGaugeAppend,
    NgxGaugePrepend,
    NgxGaugeValue,
    NgxGaugeLabel,
  ],
  exports: [
    NgxGaugeComponent,
    NgxGaugeAppend,
    NgxGaugePrepend,
    NgxGaugeValue,
    NgxGaugeLabel,
  ],
})
export class NgxGaugeModule {}
