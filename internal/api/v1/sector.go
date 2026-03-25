package v1

import (
	"Sector/internal/database"
	"Sector/internal/logger"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"slices"
	"testing"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"
	"github.com/oapi-codegen/runtime/types"
	"go.uber.org/zap"
)

type SectorAPI struct {
	Logger *zap.Logger
	DB     *database.Database
}

//#region Authentication API

//#endregion Authentication API

//#region Account API

// SearchAccounts implements ServerInterface.
func (s *SectorAPI) SearchAccounts(w http.ResponseWriter, r *http.Request) {
	var filter AccountFilter
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	accounts, err := searchItem(s.DB.Store, reflect.TypeOf(Account{}), StructToMap(filter))
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not perform database query.", http.StatusInternalServerError)
		return
	}

	// Filter out everything that is not an account

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(accounts)
}

// PutAccount implements ServerInterface.
func (s *SectorAPI) PutAccount(w http.ResponseWriter, r *http.Request) {
	var accountDetails Account
	if err := json.NewDecoder(r.Body).Decode(&accountDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	if accountDetails.CreatedAt == nil {
		var now = time.Now()
		accountDetails.CreatedAt = &now
	}

	newItem, err := addItem(s.DB.Store, accountDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// UpdateAccountByID implements ServerInterface.
func (s *SectorAPI) UpdateAccountByID(w http.ResponseWriter, r *http.Request, id types.UUID) {
	var updateDetails AccountUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	newItem, err := updateItem(s.DB.Store, id, updateDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// DeleteAccountByID implements ServerInterface.
func (s *SectorAPI) DeleteAccountByID(w http.ResponseWriter, r *http.Request, id types.UUID) {
	err := removeItem(s.DB.Store, id)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not delete within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GetAccountByID implements ServerInterface.
func (s *SectorAPI) GetAccountByID(w http.ResponseWriter, r *http.Request, id types.UUID) {
	account, err := getItem(s.DB.Store, id)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(account)
}

//#endregion Account API

//#region Group API

// SearchGroups implements ServerInterface.
func (s *SectorAPI) SearchGroups(w http.ResponseWriter, r *http.Request) {
	var filter GroupFilter
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	groups, err := searchItem(s.DB.Store, reflect.TypeOf(Group{}), StructToMap(filter))
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not perform database query.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}

// PutGroup implements ServerInterface.
func (s *SectorAPI) PutGroup(w http.ResponseWriter, r *http.Request) {
	var groupDetails Group
	if err := json.NewDecoder(r.Body).Decode(&groupDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	if groupDetails.CreatedAt == nil {
		var now = time.Now()
		groupDetails.CreatedAt = &now
	}

	newItem, err := addItem(s.DB.Store, groupDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// UpdateGroupByID implements ServerInterface.
func (s *SectorAPI) UpdateGroupByID(w http.ResponseWriter, r *http.Request, groupId types.UUID) {
	var updateDetails GroupUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	newItem, err := updateItem(s.DB.Store, groupId, updateDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// DeleteGroupByID implements ServerInterface.
func (s *SectorAPI) DeleteGroupByID(w http.ResponseWriter, r *http.Request, id types.UUID) {
	err := removeItem(s.DB.Store, id)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not delete within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GetGroupByID implements ServerInterface.
func (s *SectorAPI) GetGroupByID(w http.ResponseWriter, r *http.Request, id types.UUID) {
	group, err := getItem(s.DB.Store, id)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(group)
}

// AddGroupMember implements ServerInterface.
func (s *SectorAPI) AddGroupMember(w http.ResponseWriter, r *http.Request, groupId types.UUID, memberId types.UUID) {
	item, err := getItem(s.DB.Store, groupId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}

	var group Group
	err = MapToStruct(item.(map[string]interface{}), &group)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}

	if slices.Contains(group.Members, memberId) {
		http.Error(w, "Already a member of this group.", http.StatusInternalServerError)
		return
	}

	// Update the group by sending the new list of members
	newItem, err := updateItem(s.DB.Store, groupId, map[string]interface{}{
		"members": append(group.Members, memberId),
	})
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// RemoveGroupMember implements ServerInterface.
func (s *SectorAPI) RemoveGroupMember(w http.ResponseWriter, r *http.Request, groupId types.UUID, memberId types.UUID) {
	item, err := getItem(s.DB.Store, groupId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}

	var group Group
	err = MapToStruct(item.(map[string]interface{}), &group)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}

	if !slices.Contains(group.Members, memberId) {
		http.Error(w, "Already not a member of this group.", http.StatusInternalServerError)
		return
	}

	// Construct list of new members
	newMembers := make([]types.UUID, 0)
	for _, v := range group.Members {
		if v != memberId {
			newMembers = append(newMembers, v)
		}
	}

	// Update the group by sending the new list of members
	newItem, err := updateItem(s.DB.Store, groupId, map[string]interface{}{
		"members": newMembers,
	})
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

//#endregion Group API

//#region Channel API

// SearchChannels implements ServerInterface.
func (s *SectorAPI) SearchChannels(w http.ResponseWriter, r *http.Request) {
	var filter ChannelFilter
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	channels, err := searchItem(s.DB.Store, reflect.TypeOf(Channel{}), StructToMap(filter))
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not perform database query.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(channels)
}

// PutChannel implements ServerInterface.
func (s *SectorAPI) PutChannel(w http.ResponseWriter, r *http.Request, groupId types.UUID) {
	var channelDetails Channel
	if err := json.NewDecoder(r.Body).Decode(&channelDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	if channelDetails.CreatedAt == nil {
		var now = time.Now()
		channelDetails.CreatedAt = &now
	}

	newItem, err := addItem(s.DB.Store, channelDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// UpdateChannelByID implements ServerInterface.
func (s *SectorAPI) UpdateChannelByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID) {
	var updateDetails ChannelUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	newItem, err := updateItem(s.DB.Store, channelId, updateDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// DeleteChannelByID implements ServerInterface.
func (s *SectorAPI) DeleteChannelByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID) {
	err := removeItem(s.DB.Store, channelId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not delete within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GetChannelByID implements ServerInterface.
func (s *SectorAPI) GetChannelByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID) {
	channel, err := getItem(s.DB.Store, channelId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(channel)
}

//#endregion Channel API

//#region Message API

// SearchMessages implements ServerInterface.
func (s *SectorAPI) SearchMessages(w http.ResponseWriter, r *http.Request) {
	var filter MessageFilter
	if err := json.NewDecoder(r.Body).Decode(&filter); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	messages, err := searchItem(s.DB.Store, reflect.TypeOf(Message{}), StructToMap(filter))
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not perform database query.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// PutMessage implements ServerInterface.
func (s *SectorAPI) PutMessage(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID) {
	var messageDetails Message
	if err := json.NewDecoder(r.Body).Decode(&messageDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	if messageDetails.CreatedAt == nil {
		var now = time.Now()
		messageDetails.CreatedAt = &now
	}

	newItem, err := addItem(s.DB.Store, messageDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// UpdateMessageByID implements ServerInterface.
func (s *SectorAPI) UpdateMessageByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID, messageId types.UUID) {
	var updateDetails MessageUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateDetails); err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not parse request body.", http.StatusBadRequest)
		return
	}

	newItem, err := updateItem(s.DB.Store, messageId, updateDetails)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

// DeleteMessageByID implements ServerInterface.
func (s *SectorAPI) DeleteMessageByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID, messageId types.UUID) {
	err := removeItem(s.DB.Store, messageId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not delete within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GetMessageByID implements ServerInterface.
func (s *SectorAPI) GetMessageByID(w http.ResponseWriter, r *http.Request, groupId types.UUID, channelId types.UUID, messageId types.UUID) {
	message, err := getItem(s.DB.Store, messageId)
	if err != nil {
		s.Logger.Debug(err.Error())
		http.Error(w, "Could not get within database.", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

//#endregion Message API

//#region Misc. API

// GetHealth implements ServerInterface.
func (s *SectorAPI) GetHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

// GetRoot implements ServerInterface.
func (s *SectorAPI) GetRoot(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"message": "Hello, World!"}
	json.NewEncoder(w).Encode(response)
}

//#endregion Misc. API

// Make sure we conform to ServerInterface

var _ ServerInterface = (*SectorAPI)(nil)

// Create a new Sector API instance
func NewSector(ctx context.Context, logfile, dbCache string) *SectorAPI {
	// Setup the logger
	logger, err := logger.NewLogger(logfile)
	if err != nil {
		panic(err)
	}

	// Setup the database
	db, err := database.NewDatabase(ctx, dbCache, logger)
	if err != nil {
		panic(err)
	}
	// defer db.Disconnect() (TODO: FIGURE OUT WHEN TO CALL DISCONNECT)

	err = db.Connect(func(address string) {
		fmt.Println("Connected: ", address)
	})
	if err != nil {
		panic(err)
	}

	return &SectorAPI{
		Logger: logger,
		DB:     db,
	}
}

// Create a new SectorAPI instance for unit testing
func NewTestingSector(ctx context.Context, logfile, dbCache string, t *testing.T) *SectorAPI {
	// Setup the logger
	logger, err := logger.NewLogger(logfile)
	if err != nil {
		panic(err)
	}

	// Setup the database
	db, err := database.NewTestingDatabase(ctx, dbCache, logger, t)
	if err != nil {
		panic(err)
	}

	err = db.Connect(func(address string) {
		fmt.Println("Connected: ", address)
	})
	if err != nil {
		panic(err)
	}

	return &SectorAPI{
		Logger: logger,
		DB:     db,
	}
}

//#region Helper Functions

// Get an item from a document store as a struct (a widely used helper function, TODO: this should be even more widely used, but hasn't been refactored in yet. Ensure you pass &obj as the final arg)
func getDatabaseItem(store orbitdb.DocumentStore, id string, obj interface{}) error {
	matches, err := store.Get(context.Background(), id, &iface.DocumentStoreGetOptions{})
	if err != nil {
		return err
	}
	if len(matches) == 0 {
		return fmt.Errorf("id not in database")
	}
	if len(matches) != 1 {
		return fmt.Errorf("more than one match for id")
	}

	return MapToStruct(matches[0].(map[string]interface{}), &obj)
}

//#endregion Helper Functions
