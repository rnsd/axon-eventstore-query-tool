import { TestBed } from '@angular/core/testing';

import { DomainEventService } from './domain-event.service';

describe('DomainEventService', () => {
  let service: DomainEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
