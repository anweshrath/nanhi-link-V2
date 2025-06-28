<?php
if (!defined('ABSPATH')) {
    exit;
}

$api_client = new NanhiLinksAPIClient();
$stats = $api_client->get_stats();
?>

<div class="wrap nanhi-links-admin">
    <h1><?php _e('Nanhi.Links Dashboard', 'nanhi-links'); ?></h1>
    
    <?php if (empty(get_option('nanhi_links_api_key'))): ?>
        <div class="notice notice-warning">
            <p>
                <?php _e('Please configure your API key in the', 'nanhi-links'); ?>
                <a href="<?php echo admin_url('admin.php?page=nanhi-links-settings'); ?>">
                    <?php _e('settings page', 'nanhi-links'); ?>
                </a>
                <?php _e('to start using Nanhi.Links.', 'nanhi-links'); ?>
            </p>
        </div>
    <?php endif; ?>
    
    <?php if (!is_wp_error($stats) && $stats): ?>
        <div class="nanhi-stats-grid">
            <div class="nanhi-stat-card">
                <div class="nanhi-stat-icon">
                    <span class="dashicons dashicons-admin-links"></span>
                </div>
                <div class="nanhi-stat-content">
                    <h3><?php echo number_format($stats['total_links']); ?></h3>
                    <p><?php _e('Total Links', 'nanhi-links'); ?></p>
                </div>
            </div>
            
            <div class="nanhi-stat-card">
                <div class="nanhi-stat-icon">
                    <span class="dashicons dashicons-visibility"></span>
                </div>
                <div class="nanhi-stat-content">
                    <h3><?php echo number_format($stats['total_clicks']); ?></h3>
                    <p><?php _e('Total Clicks', 'nanhi-links'); ?></p>
                </div>
            </div>
            
            <div class="nanhi-stat-card">
                <div class="nanhi-stat-icon">
                    <span class="dashicons dashicons-chart-line"></span>
                </div>
                <div class="nanhi-stat-content">
                    <h3><?php echo number_format($stats['clicks_today']); ?></h3>
                    <p><?php _e('Clicks Today', 'nanhi-links'); ?></p>
                </div>
            </div>
            
            <div class="nanhi-stat-card">
                <div class="nanhi-stat-icon">
                    <span class="dashicons dashicons-portfolio"></span>
                </div>
                <div class="nanhi-stat-content">
                    <h3><?php echo number_format($stats['total_projects']); ?></h3>
                    <p><?php _e('Projects', 'nanhi-links'); ?></p>
                </div>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="nanhi-admin-content">
        <div class="nanhi-main-content">
            <div class="nanhi-section">
                <div class="nanhi-section-header">
                    <h2><?php _e('Recent Links', 'nanhi-links'); ?></h2>
                    <div class="nanhi-section-actions">
                        <input type="text" id="nanhi-search" placeholder="<?php _e('Search links...', 'nanhi-links'); ?>" />
                        <a href="<?php echo admin_url('admin.php?page=nanhi-links-create'); ?>" class="button button-primary">
                            <?php _e('Create New Link', 'nanhi-links'); ?>
                        </a>
                    </div>
                </div>
                
                <div id="nanhi-links-container">
                    <div class="nanhi-loading">
                        <span class="spinner is-active"></span>
                        <?php _e('Loading links...', 'nanhi-links'); ?>
                    </div>
                </div>
                
                <div id="nanhi-pagination" class="nanhi-pagination"></div>
            </div>
        </div>
        
        <div class="nanhi-sidebar">
            <div class="nanhi-widget">
                <h3><?php _e('Quick Actions', 'nanhi-links'); ?></h3>
                <div class="nanhi-quick-actions">
                    <a href="<?php echo admin_url('admin.php?page=nanhi-links-create'); ?>" class="nanhi-quick-action">
                        <span class="dashicons dashicons-plus-alt"></span>
                        <?php _e('Create Link', 'nanhi-links'); ?>
                    </a>
                    <a href="<?php echo admin_url('admin.php?page=nanhi-links-analytics'); ?>" class="nanhi-quick-action">
                        <span class="dashicons dashicons-chart-bar"></span>
                        <?php _e('View Analytics', 'nanhi-links'); ?>
                    </a>
                    <a href="https://nanhi.link/dashboard" target="_blank" class="nanhi-quick-action">
                        <span class="dashicons dashicons-external"></span>
                        <?php _e('Open Web Dashboard', 'nanhi-links'); ?>
                    </a>
                </div>
            </div>
            
            <div class="nanhi-widget">
                <h3><?php _e('Support', 'nanhi-links'); ?></h3>
                <div class="nanhi-support-links">
                    <a href="https://docs.nanhi.link" target="_blank">
                        <span class="dashicons dashicons-book"></span>
                        <?php _e('Documentation', 'nanhi-links'); ?>
                    </a>
                    <a href="https://nanhi.link/support" target="_blank">
                        <span class="dashicons dashicons-sos"></span>
                        <?php _e('Get Support', 'nanhi-links'); ?>
                    </a>
                    <a href="https://github.com/nanhi-links/wordpress-plugin" target="_blank">
                        <span class="dashicons dashicons-github"></span>
                        <?php _e('GitHub', 'nanhi-links'); ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/template" id="nanhi-link-template">
    <div class="nanhi-link-item" data-id="{{id}}">
        <div class="nanhi-link-main">
            <div class="nanhi-link-info">
                <h4 class="nanhi-link-title">{{title}}</h4>
                <div class="nanhi-link-urls">
                    <div class="nanhi-original-url">
                        <span class="dashicons dashicons-admin-links"></span>
                        <a href="{{url}}" target="_blank">{{url}}</a>
                    </div>
                    <div class="nanhi-short-url">
                        <span class="dashicons dashicons-share"></span>
                        <a href="{{short_url}}" target="_blank">{{short_url}}</a>
                        <button class="nanhi-copy-btn" data-url="{{short_url}}" title="<?php _e('Copy to clipboard', 'nanhi-links'); ?>">
                            <span class="dashicons dashicons-admin-page"></span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="nanhi-link-stats">
                <div class="nanhi-stat">
                    <span class="nanhi-stat-value">{{click_count}}</span>
                    <span class="nanhi-stat-label"><?php _e('Clicks', 'nanhi-links'); ?></span>
                </div>
                <div class="nanhi-stat">
                    <span class="nanhi-stat-value">{{created_date}}</span>
                    <span class="nanhi-stat-label"><?php _e('Created', 'nanhi-links'); ?></span>
                </div>
            </div>
        </div>
        <div class="nanhi-link-actions">
            <button class="button nanhi-analytics-btn" data-id="{{id}}">
                <span class="dashicons dashicons-chart-bar"></span>
                <?php _e('Analytics', 'nanhi-links'); ?>
            </button>
            <button class="button nanhi-edit-btn" data-id="{{id}}">
                <span class="dashicons dashicons-edit"></span>
                <?php _e('Edit', 'nanhi-links'); ?>
            </button>
            <button class="button nanhi-delete-btn" data-id="{{id}}">
                <span class="dashicons dashicons-trash"></span>
                <?php _e('Delete', 'nanhi-links'); ?>
            </button>
        </div>
    </div>
</script>
