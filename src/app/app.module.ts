import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { NextMove } from './next-move.service';
import { BoardComponent } from './board/board.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store/reducer';
import { SocketService } from './socket.service';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [BrowserModule, FormsModule, CommonModule, StoreModule.forRoot(reducers)],
  declarations: [AppComponent, BoardComponent, FooterComponent],
  bootstrap: [AppComponent],
  providers: [NextMove, SocketService],
})
export class AppModule {}
