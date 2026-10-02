-- Allow the 'mocks' collection (firm mock-process results) in user_data. Safe to re-run.
alter table user_data drop constraint if exists user_data_key_check;
alter table user_data add constraint user_data_key_check
  check (key in ('applications', 'stories', 'sessions', 'practice', 'mocks'));
