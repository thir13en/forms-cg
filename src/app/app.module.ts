import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePipe } from './pipes/date.pipe';
import { FilterExamplePipe } from './pipes/filter-example.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DatePipe,
    FilterExamplePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
