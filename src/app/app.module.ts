import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { BirdsModule } from './birds/birds.module';
import { HomeComponent } from './home/home.component';
import { CapitalFirstPipe } from './shared/pipe/capital-first.pipe';
import { SharedModule } from './shared/shared.module';
import { NavComponent } from './nav/nav.component';
import { StatService } from './service/stat.service';


@NgModule({
  declarations: [
    AppComponent, 
    HomeComponent, 
    NavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    CoreModule, 
    SharedModule, 
    BirdsModule
  ],
  providers: [StatService],  
  bootstrap: [AppComponent]
})
export class AppModule { }
