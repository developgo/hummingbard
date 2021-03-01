package cache

import (
	"github.com/dgraph-io/ristretto"
)

type Cache struct {
	Users       *ristretto.Cache
	PublicRooms *ristretto.Cache
	LargeRooms  *ristretto.Cache
	Rooms       *ristretto.Cache
	RoomMembers *ristretto.Cache
	Events      *ristretto.Cache
	RoomState   *ristretto.Cache
	Articles    *ristretto.Cache
}

func NewCache() (*Cache, error) {
	users, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	pubRooms, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	rooms, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	largeRooms, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	roomMembers, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	events, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	state, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	articles, err := ristretto.NewCache(&ristretto.Config{
		NumCounters: 1e7,
		MaxCost:     1 << 30,
		BufferItems: 64,
	})
	if err != nil {
		return nil, err
	}

	c := &Cache{
		Users:       users,
		PublicRooms: pubRooms,
		Rooms:       rooms,
		LargeRooms:  largeRooms,
		RoomMembers: roomMembers,
		Events:      events,
		RoomState:   state,
		Articles:    articles,
	}

	return c, nil
}
