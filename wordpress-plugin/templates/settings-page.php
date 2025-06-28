<?php
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submission
if (isset($_POST['submit'])) {
    check_admin_referer('nanhi_links_settings');
    
    update_option('nanhi_links_api_key', sanitize_text_field($_POST['nanhi_links_api_key']));
    update_option('nanhi_links_auto_shorten', isset($_POST['nanhi_links_auto_shorten']) ? 1 : 0);
    update_option('nanhi_links_default_project', sanitize_text_field($_POST['nanhi_links_default_project']));
    update_option('nanhi_links_track_internal', isset($_POST['nanhi_links_track_internal']) ? 1 : 0);
    
    echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'nanhi-links') . '</p></div>';
}

$api_key = get_option('nanhi_links_api_key', '');
$auto_shorten = get_option('nanhi_links_auto_shorten', false);
$default_project = get_option('nanhi_links_default_project', '');
$track_internal = get_option('nanhi_links_track_internal', false);

// Get projects for dropdown
$projects = array();
if (!empty($api_key)) {
    $api_client = new NanhiLinksAPIClient();
    $projects_response = $api_client->get_projects();
    if (!is_wp_error($projects_response) && isset($projects_response['projects'])) {
        $projects = $projects_response['projects'];
    }
}
?>

<div class="wrap nanhi-links-settings">
    <h1><?php _e('Nanhi.Links Settings', 'nanhi-links'); ?></h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('nanhi_links_settings'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="nanhi_links_api_key"><?php _e('API Key', 'nanhi-links'); ?></label>
                </th>
                <td>
                    <input type="password" id="nanhi_links_api_key" name="nanhi_links_api_key" 
                           value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                    <button type="button" id="nanhi-test-connection" class="button">
                        <?php _e('Test Connection', 'nanhi-links'); ?>
                    </button>
                    <p class="description">
                        <?php _e('Enter your Nanhi.Links API key. You can generate one from your', 'nanhi-links'); ?>
                        <a href="https://nanhi.link/settings" target="_blank"><?php _e('account settings', 'nanhi-links'); ?></a>.
                    </p>
                    <div id="nanhi-connection-status"></div>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="nanhi_links_auto_shorten"><?php _e('Auto-Shorten Links', 'nanhi-links'); ?></label>
                </th>
                <td>
                    <label>
                        <input type="checkbox" id="nanhi_links_auto_shorten" name="nanhi_links_auto_shorten" 
                               value="1" <?php checked($auto_shorten); ?> />
                        <?php _e('Automatically create short links for new posts', 'nanhi-links'); ?>
                    </label>
                    <p class="description">
                        <?php _e('When enabled, a short link will be automatically created when you publish a new post or page.', 'nanhi-links'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="nanhi_links_default_project"><?php _e('Default Project', 'nanhi-links'); ?></label>
                </th>
                <td>
                    <select id="nanhi_links_default_project" name="nanhi_links_default_project">
                        <option value=""><?php _e('No default project', 'nanhi-links'); ?></option>
                        <?php foreach ($projects as $project): ?>
                            <option value="<?php echo esc_attr($project['id']); ?>" 
                                    <?php selected($default_project, $project['id']); ?>>
                                <?php echo esc_html($project['name']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <p class="description">
                        <?php _e('Select a default project for automatically created links.', 'nanhi-links'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="nanhi_links_track_internal"><?php _e('Track Internal Links', 'nanhi-links'); ?></label>
                </th>
                <td>
                    <label>
                        <input type="checkbox" id="nanhi_links_track_internal" name="nanhi_links_track_internal" 
                               value="1" <?php checked($track_internal); ?> />
                        <?php _e('Create short links for internal WordPress links', 'nanhi-links'); ?>
                    </label>
                    <p class="description">
                        <?php _e('When enabled, links to other pages on your site will also be shortened.', 'nanhi-links'); ?>
                    </p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
    
    <div class="nanhi-settings-info">
        <h2><?php _e('Getting Started', 'nanhi-links'); ?></h2>
        
        <div class="nanhi-info-grid">
            <div class="nanhi-info-card">
                <h3><?php _e('1. Get Your API Key', 'nanhi-links'); ?></h3>
                <p><?php _e('Sign up for a free account at Nanhi.Links and generate your API key from the settings page.', 'nanhi-links'); ?></p>
                <a href="https://nanhi.link/register" target="_blank" class="button">
                    <?php _e('Sign Up Free', 'nanhi-links'); ?>
                </a>
            </div>
            
            <div class="nanhi-info-card">
                <h3><?php _e('2. Configure Settings', 'nanhi-links'); ?></h3>
                <p><?php _e('Enter your API key above and configure your preferences for automatic link creation.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-info-card">
                <h3><?php _e('3. Start Creating Links', 'nanhi-links'); ?></h3>
                <p><?php _e('Use the dashboard to create and manage your short links, or let the plugin do it automatically.', 'nanhi-links'); ?></p>
                <a href="<?php echo admin_url('admin.php?page=nanhi-links-create'); ?>" class="button button-primary">
                    <?php _e('Create Your First Link', 'nanhi-links'); ?>
                </a>
            </div>
        </div>
    </div>
    
    <div class="nanhi-features">
        <h2><?php _e('Features', 'nanhi-links'); ?></h2>
        
        <div class="nanhi-features-grid">
            <div class="nanhi-feature">
                <span class="dashicons dashicons-admin-links"></span>
                <h4><?php _e('URL Shortening', 'nanhi-links'); ?></h4>
                <p><?php _e('Create short, memorable links for any URL with custom codes and branding.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-feature">
                <span class="dashicons dashicons-chart-bar"></span>
                <h4><?php _e('Analytics', 'nanhi-links'); ?></h4>
                <p><?php _e('Track clicks, geographic data, referrers, and more with detailed analytics.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-feature">
                <span class="dashicons dashicons-portfolio"></span>
                <h4><?php _e('Project Management', 'nanhi-links'); ?></h4>
                <p><?php _e('Organize your links into projects for better management and tracking.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-feature">
                <span class="dashicons dashicons-shield"></span>
                <h4><?php _e('Security', 'nanhi-links'); ?></h4>
                <p><?php _e('Password protection, expiration dates, and click limits for enhanced security.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-feature">
                <span class="dashicons dashicons-smartphone"></span>
                <h4><?php _e('Mobile Friendly', 'nanhi-links'); ?></h4>
                <p><?php _e('Responsive design that works perfectly on all devices and screen sizes.', 'nanhi-links'); ?></p>
            </div>
            
            <div class="nanhi-feature">
                <span class="dashicons dashicons-rest-api"></span>
                <h4><?php _e('API Integration', 'nanhi-links'); ?></h4>
                <p><?php _e('Full REST API access for custom integrations and automated workflows.', 'nanhi-links'); ?></p>
            </div>
        </div>
    </div>
</div>
