import {Component, OnInit, ViewChild} from '@angular/core';
import {DomainEvent} from "../domain/domain-event";
import {DomainEventService} from "../service/domain-event.service";
import {MatPaginator} from "@angular/material/paginator";
import {ActivatedRoute} from "@angular/router";
import {tap} from "rxjs/operators";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {FormBuilder} from "@angular/forms";
import {DateSearchOption} from "../domain/date-search-option";
import {TimeUnit} from "../domain/time-unit";
import {DateRange} from "../domain/date-range";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-event-store',
  templateUrl: './event-store.component.html',
  styleUrls: ['./event-store.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class EventStoreComponent implements OnInit {

  dataSource: MatTableDataSource<DomainEvent>;
  totalHits: number;
  columnsToDisplay = ['payloadSimpleType', 'payloadRevision', 'timeStamp', 'eventIdentifier', 'aggregateIdentifier', 'type', 'globalIndex', 'sequenceNumber']
  expandedElement: DomainEvent | null;

  public readonly dateQuickSearchOptions: DateSearchOption[] = [
    new DateSearchOption("Last 15 minutes", 15, TimeUnit.MINUTE),
    new DateSearchOption("Last 24 hours", 24, TimeUnit.HOUR),
    new DateSearchOption("Last 30 minutes", 30, TimeUnit.MINUTE),
    new DateSearchOption("Last 7 days", 7, TimeUnit.DAY),
    new DateSearchOption("Last 1 hour", 1, TimeUnit.HOUR),
    new DateSearchOption("Last 30 days", 30, TimeUnit.DAY),
    new DateSearchOption("Last 4 hours", 4, TimeUnit.HOUR),
    new DateSearchOption("Last 6 months", 6, TimeUnit.MONTH),
    new DateSearchOption("Last 12 hours", 12, TimeUnit.HOUR),
    new DateSearchOption("Last 1 year", 1, TimeUnit.YEAR)
  ]

  @ViewChild(MatPaginator) paginator: MatPaginator;

  searchForm = this.formBuilder.group(
    {
      aggregateIdentifier: null,
      eventIdentifier: null,
      payloadSimpleType: null,
      payloadContent: null,
      quickSearchDescription: null
    }
  )

  constructor(private domainEventService: DomainEventService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.dataSource = this.route.snapshot.data["app-event-store"];
    this.domainEventService.searchEvents(null, null, null, null, null, null, '', 'asc', 0, 10)
      .subscribe(searchResult => {
        this.dataSource = new MatTableDataSource<DomainEvent>(searchResult.domainEvents);
        this.totalHits = searchResult.totalNumberOfSearchHits;
      });
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadEventsPage())
      )
      .subscribe();
  }

  loadEventsPage() {
    let dateRange = this.getQuickSearchDateRange();

    let searchResultObservable = this.domainEventService.searchEvents(
      this.searchForm.get('eventIdentifier').value,
      this.searchForm.get('aggregateIdentifier').value,
      this.searchForm.get('payloadSimpleType').value,
      dateRange != null ? dateRange.from : null,
      dateRange != null ? dateRange.to : null,
      EventStoreComponent.formatPayloadContentSearchParam(this.searchForm.get('payloadContent').value),
      '',
      'asc',
      this.paginator.pageIndex,
      this.paginator.pageSize);

    searchResultObservable.subscribe(searchResult => {
      this.dataSource = new MatTableDataSource<DomainEvent>(searchResult.domainEvents);
      this.totalHits = searchResult.totalNumberOfSearchHits;
    });
  }

  formattedPayload(): string {
    if (this.expandedElement != null) {
      return JSON.stringify(JSON.parse(this.expandedElement.payload), null, "\t");
    }
  }

  private static formatPayloadContentSearchParam(payloadContent: string): string {
    if (payloadContent != null) {
      return payloadContent.replace(/\"/g, "").replace(/\s/g, "");
    }
    return null;
  }

  onSubmit() {
    this.loadEventsPage()
  }

  onReset() {
    this.searchForm.reset();
  }

  private getQuickSearchDateRange(): DateRange {
    let quickSearchDescription = this.searchForm.get('quickSearchDescription');
    let quickSearchOption: DateSearchOption = quickSearchDescription.value == null || quickSearchDescription.value.empty ? null : quickSearchDescription.value[0];
    if (quickSearchOption == null) {
      return null;

    }

    let quantity = quickSearchOption.quantity;
    let unit = quickSearchOption.unit;

    let toDate = new Date();
    let fromDate = new Date(toDate.getTime());
    if (unit == TimeUnit.MINUTE) {
      fromDate = new Date(fromDate.setMinutes(toDate.getMinutes() - quantity));
    } else if (unit == TimeUnit.HOUR) {
      fromDate = new Date(fromDate.setHours(toDate.getHours() - quantity));
    } else if (unit == TimeUnit.DAY) {
      fromDate = new Date(fromDate.setDate(toDate.getDate() - quantity));
    } else if (unit == TimeUnit.MONTH) {
      fromDate = new Date(fromDate.setMonth(toDate.getMonth() - quantity));
    } else if (unit == TimeUnit.YEAR) {
      fromDate = new Date(fromDate.setFullYear(toDate.getFullYear() - quantity));
    }
    return new DateRange(fromDate, toDate);
  }


}
