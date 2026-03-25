package database

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/ipfs/kubo/config"
	core "github.com/ipfs/kubo/core"
	coreiface "github.com/ipfs/kubo/core/coreiface"

	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/event"
	"github.com/libp2p/go-libp2p/core/peer"

	"go.uber.org/zap"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/documentstore"
)

// Representation of the database (and related things)
type Database struct {
	ctx              context.Context
	ConnectionString string // The url that was used to attempt connection
	URI              string // The URI that we connected on
	LocalPath        string // Where in the local file system we store things

	Logger *zap.Logger

	IPFSNode    *core.IpfsNode    // The IPFS node the database is running on
	IPFSCoreAPI coreiface.CoreAPI // The IPFS API the database is running on

	OrbitDB orbitdb.OrbitDB       // The Go-Orbit-DB instance
	Store   orbitdb.DocumentStore // The document store within the Go-Orbit-DB instance
	Events  event.Subscription    // Fires an event when Store is ready
}

func (db *Database) init() error {
	var err error

	ctx := context.Background()

	db.Logger.Debug("Initializing NewOrbitDB ...")
	db.OrbitDB, err = orbitdb.NewOrbitDB(ctx, db.IPFSCoreAPI, &orbitdb.NewOrbitDBOptions{
		Directory: &db.LocalPath,
		Logger:    db.Logger,
	})
	if err != nil {
		return err
	}

	ac := &accesscontroller.CreateAccessControllerOptions{
		Access: map[string][]string{
			"write": {
				"*",
			},
		},
	}

	addr, err := db.OrbitDB.DetermineAddress(db.ctx, "sectordb", "docstore", &orbitdb.DetermineAddressOptions{})
	if err != nil {
		return err
	}
	db.URI = addr.String()

	storetype := "docstore"
	db.Logger.Debug("Initializing OrbitDB.Docs ...")
	db.Store, err = db.OrbitDB.Docs(ctx, db.URI, &orbitdb.CreateDBOptions{
		AccessController:  ac,
		StoreType:         &storetype,
		StoreSpecificOpts: documentstore.DefaultStoreOptsForMap("id"),
		Timeout:           time.Second * 600,
	})
	if err != nil {
		return err
	}

	db.Logger.Debug("Subscribing to EventBus ...")
	db.Events, err = db.Store.EventBus().Subscribe(new(stores.EventReady))
	return err
}

func (db *Database) GetOwnID() string {
	return db.OrbitDB.Identity().ID
}

func (db *Database) GetOwnPubKey() crypto.PubKey {
	pubKey, err := db.OrbitDB.Identity().GetPublicKey()
	if err != nil {
		return nil
	}

	return pubKey
}

func (db *Database) connectToPeers() error {
	var wg sync.WaitGroup

	peerInfos, err := config.DefaultBootstrapPeers()
	if err != nil {
		return err
	}

	wg.Add(len(peerInfos))
	for _, peerInfo := range peerInfos {
		go func(peerInfo *peer.AddrInfo) {
			defer wg.Done()
			err := db.IPFSCoreAPI.Swarm().Connect(db.ctx, *peerInfo)
			if err != nil {
				db.Logger.Error("Failed to connect", zap.String("peerID", peerInfo.ID.String()), zap.Error(err))
			} else {
				db.Logger.Debug("Connected!", zap.String("peerID", peerInfo.ID.String()))
			}
		}(&peerInfo)
	}
	wg.Wait()
	return nil
}

func NewDatabase(ctx context.Context, dbLocalPath string, logger *zap.Logger) (*Database, error) {
	var err error

	db := new(Database)
	db.ctx = ctx
	db.LocalPath = dbLocalPath
	db.Logger = logger

	db.Logger.Debug("Getting config root path ...")
	defaultPath, err := config.PathRoot()
	if err != nil {
		return nil, err
	}

	db.Logger.Debug("Setting up plugins ...")
	if err := setupPlugins(defaultPath); err != nil {
		return nil, err
	}

	db.Logger.Debug("Creating IPFS repo ...")
	repoPath, err := createRepo(defaultPath)
	if err != nil {
		panic(err)
	}

	db.Logger.Debug("Creating IPFS node ...")
	db.IPFSCoreAPI, db.IPFSNode, err = createNode(ctx, repoPath)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// Create a new testing database instance
func NewTestingDatabase(ctx context.Context, dbLocalPath string, logger *zap.Logger, t *testing.T) (*Database, error) {
	db := new(Database)
	db.ctx = ctx
	db.LocalPath = dbLocalPath
	db.Logger = logger

	// Setup the IPFS mock instance (TODO: test this and figure out if cleanup is done properly)
	mocknet := testingMockNet(t)
	db.IPFSNode, _ = testingIPFSNode(ctx, t, mocknet)
	db.IPFSCoreAPI = testingCoreAPI(t, db.IPFSNode)
	return db, nil
}

func (db *Database) Connect(onReady func(address string)) error {
	var err error

	db.Logger.Info("Connecting to peers ...")
	err = db.connectToPeers()
	if err != nil {
		db.Logger.Error("Failed to connect: %s", zap.Error(err))
	} else {
		db.Logger.Debug("Connected to peer!")
	}

	db.Logger.Info("Initializing database connection ...")
	err = db.init()
	if err != nil {
		db.Logger.Error("%s", zap.Error(err))
		return err
	}

	db.Logger.Info("Running ...")
	go func() {
		for {
			for ev := range db.Events.Out() {
				db.Logger.Debug("Got event", zap.Any("event", ev))
				switch ev.(type) {
				case stores.EventReady:
					db.URI = db.Store.Address().String()
					onReady(db.URI)
					continue
				}
			}
		}
	}()

	err = db.Store.Load(db.ctx, -1)
	if err != nil {
		db.Logger.Error("%s", zap.Error(err))
		return err
	}

	db.Logger.Debug("Connect done")
	return nil
}

func (db *Database) Disconnect() {
	db.Events.Close()
	db.Store.Close()
	db.OrbitDB.Close()
}
