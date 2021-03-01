-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS slug_to_event(
    id BIGSERIAL PRIMARY KEY,
    room_path text NOT NULL,
    slug text NOT NULL,
    event_id text UNIQUE NOT NULL,
    UNIQUE(room_path, slug, event_id),
    created_at timestamp WITH time zone DEFAULT now(),
    updated_at timestamp WITH time zone,
    deleted boolean NOT NULL default false,
    deleted_at timestamp WITH time zone
);
CREATE INDEX slug_to_event_idx on slug_to_event(slug);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS slug_to_event;
-- +goose StatementEnd
