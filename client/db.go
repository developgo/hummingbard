package client

import (
	"context"
	"database/sql"
	"fmt"
	"hummingbard/config"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DB struct {
	*sqlx.DB
}

// NewDB returns a new database instace
func NewDB() (*DB, error) {

	c, err := config.Read()
	if err != nil {
		panic(err)
	}
	conn := fmt.Sprintf("host=%s port=%s user=%s "+
		"password=%s dbname=%s sslmode=%s",
		c.DB.Host, c.DB.Port, c.DB.User, c.DB.Password, c.DB.Name, c.DB.SSL)

	db, err := sqlx.Open("postgres", conn)
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	store := &DB{db}
	return store, nil
}

func Slugify(title string) string {
	sp := strings.Split(title, " ")
	jp := strings.Join(sp, "-")
	lp := strings.ToLower(jp)

	reg := regexp.MustCompile("[^a-zA-Z0-9-]+")
	slug := reg.ReplaceAllString(lp, "")

	return slug
}

func (c *Client) DoesSlugExist(ctx context.Context, roomPath, slug string) (bool, error) {
	var exists bool
	err := c.DB.QueryRow("select exists(select 1 from slug_to_event where room_path=$1 and slug=$2)", roomPath, slug).Scan(&exists)
	if err != nil || err == sql.ErrNoRows {
		log.Println(err)
		return true, err
	}
	return exists, nil
}

func (c *Client) GetSlugEventID(ctx context.Context, roomPath, slug string) (string, error) {
	var event string
	err := c.DB.QueryRow("select event_id from slug_to_event where room_path=$1 and slug=$2", roomPath, slug).Scan(&event)
	if err != nil || err == sql.ErrNoRows {
		log.Println(err)
		return "", err
	}
	return event, nil
}

func (c *Client) UpdateEventSlug(ctx context.Context, roomPath, slug, event string) (bool, error) {

	_, err := c.DB.Exec(`INSERT INTO slug_to_event(room_path, slug, event_id) VALUES($1, $2, $3)`, roomPath, slug, event)
	log.Println(err)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (c *Client) AddRoom(ctx context.Context, userID, roomID, roomAlias, path string) error {

	_, err := c.DB.Exec(`INSERT INTO rooms(user_id, room_id, room_alias, room_path) VALUES($1, $2, $3, $4)`, userID, roomID, roomAlias, path)
	log.Println(err)
	if err != nil {
		return err
	}

	return nil
}

func (c *Client) GetUserRooms(ctx context.Context, userID string) ([]*OwnedRoom, error) {

	query := `
		select 
            rooms.room_id,
            rooms.room_alias
		FROM rooms 
		WHERE user_id=$1
        LIMIt 53
    `
	sargs := []interface{}{userID}

	rows, err := c.DB.Queryx(query, sargs...)
	if err != nil || err == sql.ErrNoRows {
		log.Println(err)
		return nil, err
	}

	rooms := []*OwnedRoom{}

	for rows.Next() {
		results := make(map[string]interface{})
		err = rows.MapScan(results)

		room := OwnedRoom{}

		id, ok := results["room_id"].(string)
		if ok {
			room.RoomID = id
		}

		alias, ok := results["room_alias"].(string)
		if ok {
			room.RoomAlias = alias
		}

		rooms = append(rooms, &room)

	}

	return rooms, nil
}

func (c *Client) GetAllRooms(ctx context.Context) (map[string]string, error) {

	query := `
		select 
            rooms.room_id,
            rooms.room_alias
		FROM rooms 
    `

	rows, err := c.DB.Queryx(query)
	if err != nil || err == sql.ErrNoRows {
		log.Println(err)
		return nil, err
	}

	rooms := map[string]string{}

	for rows.Next() {
		results := make(map[string]interface{})
		err = rows.MapScan(results)

		id, ok := results["room_id"].(string)
		alias, ok := results["room_alias"].(string)
		if ok {
			rooms[id] = alias
		}

	}

	return rooms, nil
}
