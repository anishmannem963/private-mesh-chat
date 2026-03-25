package database

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/ipfs/kubo/config"
	core "github.com/ipfs/kubo/core"
	"github.com/ipfs/kubo/core/coreapi"
	coreiface "github.com/ipfs/kubo/core/coreiface"
	"github.com/ipfs/kubo/core/node/libp2p"
	"github.com/ipfs/kubo/plugin/loader"
	"github.com/ipfs/kubo/repo/fsrepo"
)

func setupPlugins(path string) error {
	plugins, err := loader.NewPluginLoader(filepath.Join(path, "plugins"))
	if err != nil {
		return fmt.Errorf("error loading plugins: %s", err)
	}

	if err := plugins.Initialize(); err != nil {
		return fmt.Errorf("error initializing plugins: %s", err)
	}

	if err := plugins.Inject(); err != nil {
		return fmt.Errorf("error initializing plugins: %s", err)
	}

	return nil
}

// Creates an IPFS repo, and returns its path.
func createRepo(repoPath string) (string, error) {
	if _, err := os.Stat(filepath.Join(repoPath, "config")); os.IsNotExist(err) {
		cfg, err := config.Init(os.Stdout, 4096)
		if err != nil {
			return "", fmt.Errorf("failed to initialize IPFS config: %v", err)
		}

		if err := fsrepo.Init(repoPath, cfg); err != nil {
			return "", fmt.Errorf("failed to initialize IPFS repo: %v", err)
		}
	}

	return repoPath, nil
}

// Creates an IPFS node and returns its coreAPI.
func createNode(ctx context.Context, repoPath string) (coreiface.CoreAPI, *core.IpfsNode, error) {
	// Open the repo
	repo, err := fsrepo.Open(repoPath)
	if err != nil {
		return nil, nil, err
	}

	// Construct the node
	nodeOptions := &core.BuildCfg{
		Online:  true,
		Routing: libp2p.DHTOption, // This option sets the node to be a full DHT node (both fetching and storing DHT Records)
		// Routing: libp2p.DHTClientOption, // This option sets the node to be a client DHT node (only fetching records)
		Repo: repo,
		ExtraOpts: map[string]bool{
			"pubsub": true, // Enable PubSub
		},
	}

	node, err := core.NewNode(ctx, nodeOptions)
	if err != nil {
		return nil, nil, err
	}

	api, err := coreapi.NewCoreAPI(node)
	if err != nil {
		return nil, nil, err
	}

	return api, node, nil
}
