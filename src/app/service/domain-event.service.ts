import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {DatePipe} from "@angular/common";
import {SearchResult} from "../domain/search-result";

@Injectable({
  providedIn: 'root'
})
export class DomainEventService {

  private url = 'http://localhost:8080';

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(private http: HttpClient) {
  }

  searchEvents(eventIdentifier: string,
               aggregateIdentifier: string,
               payloadSimpleType: string,
               from: Date,
               to: Date,
               payloadContent: string,
               filter = '',
               sortOrder = 'asc',
               pageNumber = 0, pageSize = 10): Observable<SearchResult> {

    let params = [];

    if (eventIdentifier != null) params.push(`eventIdentifier=${eventIdentifier}`);
    if (aggregateIdentifier != null) params.push(`aggregateIdentifier=${aggregateIdentifier}`);
    if (payloadSimpleType != null) params.push(`payloadSimpleType=${payloadSimpleType}`);
    if (payloadContent!= null) params.push(`payloadContent=${payloadContent}`)
    if (from != null) params.push(`fromDate=${this.format(from)}`)
    if (to != null) params.push(`toDate=${this.format(to)}`)

    params.push(`sortOrder=${sortOrder}`)
    params.push(`pageNumber=${pageNumber}`)
    params.push(`pageSize=${pageSize}`)

    return this.http.get<SearchResult>(this.url + '/events?' + params.join('&'))
  }

  private format(date): string {
    const datePipe: DatePipe = new DatePipe('en-US')
    return datePipe.transform(date, 'yyyy-dd-MM HH:mm:ss')
  }


}
