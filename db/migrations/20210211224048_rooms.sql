-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS rooms(
    id BIGSERIAL PRIMARY KEY,
    user_id text NOT NULL,
    room_id text NOT NULL,
    room_alias text NOT NULL,
    room_path text NOT NULL,
    UNIQUE(user_id, room_id),
    created_at timestamp WITH time zone DEFAULT now(),
    updated_at timestamp WITH time zone,
    deleted boolean NOT NULL default false,
    deleted_at timestamp WITH time zone
);
CREATE INDEX rooms_idx on rooms(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS rooms;
-- +goose StatementEnd
