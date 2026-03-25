package v1

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"slices"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"
	"github.com/google/uuid"
	"github.com/lithammer/fuzzysearch/fuzzy"
	"github.com/oapi-codegen/runtime/types"
)

var ErrNotFound = errors.New("item for id not found")
var ErrTooMany = errors.New("too many items for id found")

/**
 * Add a new item into the database
 */
func addItem(store orbitdb.DocumentStore, obj interface{}) (interface{}, error) {
	// Check if item with this ID already exists in the database...
	_, err := getItem(store, uuid.Must(uuid.Parse(StructToMap(obj)["id"].(string))))
	if err == nil || err != ErrNotFound {
		return nil, fmt.Errorf("cannot add item to database")
	}

	/*
		Based on the type of item we are inserting, we have to perform other actions to keep consistency of data...

		=> Account - nothing
		=> Group - nothing
		=> Channel - must have valid group id
		=> Message - must have valid channel id and author id
	*/
	switch item := obj.(type) {
	case Account:
		// Check dependencies when adding an account object
	case Group:
		// Check dependencies when adding a group object
	case Channel:
		group, err := searchItem(store, reflect.TypeOf(Group{}), map[string]interface{}{
			"id": []string{item.Group.String()}, // We search within groups by ID, from the item's group
		})
		if err != nil {
			return nil, fmt.Errorf("%s", "cannot find group associated with channel"+err.Error())
		}
		if len(group) != 1 {
			return nil, fmt.Errorf("%s", "cannot find group associated with channel"+err.Error())
		}
	case Message:
		channel, err := searchItem(store, reflect.TypeOf(Channel{}), map[string]interface{}{
			"id": []string{item.Channel.String()}, // We search within channels by ID, from the item's channel
		})
		if err != nil {
			return nil, fmt.Errorf("%s", "cannot find channel associated with message"+err.Error())
		}
		if len(channel) != 1 {
			return nil, fmt.Errorf("%s", "cannot find channel associated with message"+err.Error())
		}

		author, err := searchItem(store, reflect.TypeOf(Account{}), map[string]interface{}{
			"id": []string{item.Author.String()},
		})
		if err != nil {
			return nil, fmt.Errorf("%s", "cannot find author associated with message"+err.Error())
		}
		if len(author) != 1 {
			return nil, fmt.Errorf("%s", "cannot find author associated with message"+err.Error())
		}
	default:
		return nil, fmt.Errorf("cannot add unknown item '%v' type to database", item)
	}

	// Adds the item to the database
	op, err := store.Put(context.Background(), StructToMap(obj))
	if err != nil {
		return nil, err
	}

	// Convert to 'readable' interface format instead of string
	var result map[string]interface{}
	err = json.Unmarshal([]byte(op.GetValue()), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

/**
 * Get an item from the database
 */
func getItem(store orbitdb.DocumentStore, id types.UUID) (interface{}, error) {
	matches, err := store.Get(context.Background(), id.String(), &iface.DocumentStoreGetOptions{})
	if err != nil {
		return nil, err
	}
	if len(matches) == 0 {
		return nil, ErrNotFound
	}
	if len(matches) > 1 {
		return nil, ErrTooMany
	}
	return matches[0], nil
}

/**
 * Update an item in the database
 */
func updateItem(store orbitdb.DocumentStore, id types.UUID, obj interface{}) (interface{}, error) {
	// Get the item to update from the DB
	dbItem, err := getItem(store, id)
	if err != nil {
		return nil, err
	}

	// Update values
	updatedItem := dbItem.(map[string]interface{})
	updatesToApply := StructToMap(obj)
	for key, value := range updatesToApply {
		updatedItem[key] = value
	}

	/*
		Based on the type of item we are updating, we have to perform other actions to keep consistency of data...

		=> Account - none
		=> Group - have to check that all members exist
		=> Channel - none
		=> Message - none
	*/
	switch item := obj.(type) {
	case AccountUpdate:
	case GroupUpdate:
	case ChannelUpdate:
	case MessageUpdate:
	default:
		// THE BELOW IS BAD, BUT FOR NOW WORKING... TODO: FIX THIS SO THAT WE HAVE SOME FORM OF 'INTERNAL UPDATE
		members, ok := updatedItem["members"].([]interface{})
		if ok {
			found_members, err := searchItem(store, reflect.TypeOf(Account{}), map[string]interface{}{
				"id": members,
			})
			if err != nil {
				return nil, fmt.Errorf("%s", "cannot find author associated with message"+err.Error())
			}
			if len(found_members) != len(members) {
				return nil, fmt.Errorf("%s", "cannot find author associated with message"+err.Error())
			}
		} else {
			return nil, fmt.Errorf("cannot add unknown item '%v' type to database", item)
		}
	}

	// Updates the item to the database
	op, err := store.Put(context.Background(), updatedItem)
	if err != nil {
		return nil, err
	}

	// Convert to 'readable' interface format instead of string
	var result map[string]interface{}
	err = json.Unmarshal([]byte(op.GetValue()), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

/**
 * Remove an item in the database
 */
func removeItem(store orbitdb.DocumentStore, id types.UUID) error {
	// Get the item to delete from the DB
	dbItem, err := getItem(store, id)
	if err != nil {
		return fmt.Errorf("%s", "cannot delete item from database"+err.Error())
	}

	entry, err := DetectAndUnmarshal(dbItem.(map[string]interface{}))
	if err != nil {
		return fmt.Errorf("%s", "cannot determine type of item to delete from database"+err.Error())
	}

	/*
		Based on the type of item we are deleting, we have to perform other actions to keep consistency of data...

		=> Account - have to remove the reference to the account ID from all groups the user was a member of
		=> Group - have to delete all channels in the group, and all messages in those channels
		=> Channel - have to delete all messages in the channel
		=> Message - no other actions to perform
	*/
	switch item := entry.(type) {
	case *Account:
		// When deleting an account, update groups so that there are no references to the account within the group members list
		groups, err := searchItem(store, reflect.TypeOf(Group{}), map[string]interface{}{
			"members": []string{item.Id.String()},
		})
		if err != nil {
			return fmt.Errorf("cannot get groups associated with account to delete: %v", err.Error())
		}

		// Update all those groups to remove the user from their members list
		for _, g := range groups {
			var group Group
			err := MapToStruct(g.(map[string]interface{}), &group)
			if err != nil {
				return fmt.Errorf("%s", "error updating group members list associated with user: "+err.Error())
			}

			// Update the group members (TODO: this could probably be done in a batch update)
			_, err = updateItem(store, group.Id, map[string]interface{}{
				"members": slices.DeleteFunc(group.Members, func(x types.UUID) bool {
					return x.String() == item.Id.String()
				}),
			})
			if err != nil {
				return fmt.Errorf("%s", "error updating group members list associated with user: "+err.Error())
			}
		}

	case *Group:
		// Get all the channels associated with the group using a search in the DB.
		channels, err := searchItem(store, reflect.TypeOf(Channel{}), map[string]interface{}{
			"group": []string{item.Id.String()},
		})
		if err != nil {
			return fmt.Errorf("%s", "cannot find channels associated with group"+err.Error())
		}

		// Loop over every channel, convert to expected struct type, extract Id
		channelIds := make([]string, 0)
		for _, c := range channels {
			var channel Channel
			err := MapToStruct(c.(map[string]interface{}), &channel)
			if err != nil {
				return fmt.Errorf("%s", "error deleting channel associated with group"+err.Error())
			}

			// Extract ids...
			channelIds = append(channelIds, channel.Id.String())

			// Delete all the items found above from the DB (TODO: find better way to drop all the items at once rather than individual deletion, if this is possible)
			_, err = store.Delete(context.Background(), channel.Id.String())
			if err != nil {
				return fmt.Errorf("%s", "error deleting messages associated with channel associated with group"+err.Error())
			}
		}

		// Get all the messages associated with the channels associated with the group using a search in the DB.
		messages, err := searchItem(store, reflect.TypeOf(Message{}), map[string]interface{}{
			"channel": channelIds,
		})
		if err != nil {
			return fmt.Errorf("%s", "cannot find messages associated with channels of group"+err.Error())
		}

		// Delete all the items found above from the DB (TODO: find better way to drop all the items at once rather than individual deletion, if this is possible)
		for _, m := range messages {
			var message Message
			err := MapToStruct(m.(map[string]interface{}), &message)
			if err != nil {
				return fmt.Errorf("%s", "error deleting messages associated with channel associated with group: "+err.Error())
			}

			_, err = store.Delete(context.Background(), message.Id.String())
			if err != nil {
				return fmt.Errorf("%s", "error deleting messages associated with channel associated with group: "+err.Error())
			}
		}

	case *Channel:
		// When deleting a channel, recursively delete all related messages
		messages, err := searchItem(store, reflect.TypeOf(Message{}), map[string]interface{}{
			"channel": []string{item.Id.String()},
		})
		if err != nil {
			return fmt.Errorf("%s", "cannot find messages associated with channel: "+err.Error())
		}

		// Delete all the items found above from the DB (TODO: find better way to drop all the items at once rather than individual deletion, if this is possible)
		for _, m := range messages {
			var message Message
			err := MapToStruct(m.(map[string]interface{}), &message)
			if err != nil {
				return fmt.Errorf("%s", "error deleting messages associated with channel: "+err.Error())
			}

			_, err = store.Delete(context.Background(), message.Id.String())
			if err != nil {
				return fmt.Errorf("%s", "error deleting messages associated with channel: "+err.Error())
			}
		}

	case *Message:
		// When deleting a message, nothing special is needed
	default:
		return fmt.Errorf("cannot determine type of item to delete: %v", item)
	}

	// Now delete the item itself
	_, err = store.Delete(context.Background(), id.String())
	if err != nil {
		return fmt.Errorf("%s", "error deleting item: "+err.Error())
	}
	return nil
}

/**
 * Search for items in the database satisfying some filter!
 *
 * IF a field is null (on object or filter), the filter for it is skipped!
 */

func searchItem(store orbitdb.DocumentStore, t reflect.Type, filter map[string]interface{}) ([]interface{}, error) {
	containsBehavior := func(entryValue, filterValue interface{}) bool {
		// Use reflection to check if filterValue is a slice
		v := reflect.ValueOf(filterValue)
		if v.Kind() == reflect.Slice {
			// Iterate through the slice and check for equality
			for i := 0; i < v.Len(); i++ {
				if v.Index(i).Interface() == entryValue {
					return true
				}
			}
		}
		return false
	}

	containsAllBehavior := func(entryValue, filterValue interface{}) bool {
		if entrySlice, ok := entryValue.([]interface{}); ok {
			if filterSlice, ok := filterValue.([]interface{}); ok {
				// Check if filterSlice is subset of entrySlice (IE all filter elements present in entry)
				for _, subElem := range filterSlice {
					if !slices.Contains(entrySlice, subElem) {
						return false
					}
				}
				return true
			}
		}
		return false
	}

	dateBeforeBehavior := func(entryValue, filterValue interface{}) bool {
		parsedEntryTime, err := time.Parse(time.RFC3339, entryValue.(string))
		if err != nil {
			return false
		}
		parsedFilterTime, err := time.Parse(time.RFC3339, filterValue.(string))
		if err != nil {
			return false
		}
		return parsedEntryTime.Before(parsedFilterTime)
	}

	dateAfterBehavior := func(entryValue, filterValue interface{}) bool {
		parsedEntryTime, err := time.Parse(time.RFC3339, entryValue.(string))
		if err != nil {
			return false
		}
		parsedFilterTime, err := time.Parse(time.RFC3339, filterValue.(string))
		if err != nil {
			return false
		}
		return parsedEntryTime.After(parsedFilterTime)
	}

	fuzzyMatchBehavior := func(entryValue, filterValue interface{}) bool {
		return fuzzy.Match(filterValue.(string), entryValue.(string))
	}

	exactMatchBehavior := func(entryValue, filterValue interface{}) bool {
		return entryValue == filterValue
	}

	// A filter behavior call will return false if the filter fails, and true if it passes
	filterBehaviors := map[string]func(entryValue, filterValue interface{}) bool{
		"id":       containsBehavior,
		"from":     dateAfterBehavior,
		"until":    dateBeforeBehavior,
		"group":    containsBehavior,
		"author":   containsBehavior,
		"channel":  containsBehavior,
		"members":  containsAllBehavior,
		"username": fuzzyMatchBehavior,
		"name":     fuzzyMatchBehavior,
		"body":     fuzzyMatchBehavior,
		"pinned":   exactMatchBehavior,
	}

	// Standard search behavior for non-date filters
	result, err := store.Query(context.Background(), func(doc interface{}) (bool, error) {
		entry, ok := doc.(map[string]interface{})
		if !ok {
			return false, nil
		}

		// Ensure expected type
		detected, err := DetectAndUnmarshal(entry)
		if err != nil || reflect.TypeOf(detected).Elem().Name() != t.Name() {
			return false, nil
		}


		// Apply filters and discard 'entry' if not a match
		for key, value := range filter {
			entryKey := key
			if key == "from" || key == "until" {
				entryKey = "created_at"
			}

			// If there is a nil, we don't process that filter
			if entry[entryKey] == nil || value == nil {
				continue
			}

			// Use the associated filter behavior to determine if we discard this or not
			if behavior, ok := filterBehaviors[key]; ok {
				if !behavior(entry[entryKey], value) {
					return false, nil
				}
			}
		}

		return true, nil
	})
	if err != nil {
		return nil, err
	}

	return result, nil
}

//#region Helpers

// Whenever we want to convert something from a struct to the database representation use this.
func StructToMap(obj interface{}) map[string]interface{} {
	// Marshal struct to JSON
	data, _ := json.Marshal(obj)

	// Unmarshal JSON into a map
	var result map[string]interface{}
	json.Unmarshal(data, &result)

	return result
}

// Whenever we want to convert something in the database to a struct use this.
func MapToStruct(data map[string]interface{}, obj interface{}) error {
	// Marshal map to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Unmarshal JSON into Group struct
	err = json.Unmarshal(jsonData, &obj)
	if err != nil {
		return err
	}
	return nil
}

// Function to determine struct type
func DetectAndUnmarshal(data map[string]interface{}) (interface{}, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	// List all possible struct types
	var possibleTypes = []interface{}{&Account{}, &Group{}, &Channel{}, &Message{}}
	var bestMatch interface{}
	var bestMatchFieldCount int

	// Try unmarshaling into each struct
	for _, candidate := range possibleTypes {
		target := reflect.New(reflect.TypeOf(candidate).Elem()).Interface()

		err := json.Unmarshal(jsonData, target)
		if err == nil {
			if !isEmpty(target) {
				// Count non-zero fields
				fieldCount := countNonEmptyFields(target)

				// Pick the struct with the most matching fields
				if fieldCount > bestMatchFieldCount {
					bestMatch = target
					bestMatchFieldCount = fieldCount
				}
			}
		}
	}

	// Return best match if it exists
	if bestMatch != nil {
		return bestMatch, nil
	}

	return nil, fmt.Errorf("unknown struct type")
}

// Function to count the number of non empty fields in a struct.
func countNonEmptyFields(target interface{}) int {
	val := reflect.ValueOf(target).Elem()
	count := 0

	for i := 0; i < val.NumField(); i++ {
		if !reflect.DeepEqual(val.Field(i).Interface(), reflect.Zero(val.Field(i).Type()).Interface()) {
			count++
		}
	}

	return count
}

// Function to check if a struct is empty (i.e., no fields populated)
func isEmpty(v interface{}) bool {
	val := reflect.ValueOf(v).Elem()
	for i := 0; i < val.NumField(); i++ {
		if !val.Field(i).IsZero() {
			return false
		}
	}
	return true
}

//#endregion Helpers
