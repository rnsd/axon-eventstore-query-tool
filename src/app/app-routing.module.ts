import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventStoreComponent} from "./event-store/event-store.component";


const routes: Routes = [
  {
    path: "",
    component: EventStoreComponent
  },
  {
    path: "**",
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
