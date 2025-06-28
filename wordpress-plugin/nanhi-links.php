<?php
/**
 * Plugin Name: Nanhi.Links Integration
 * Plugin URI: https://nanhi.link/wordpress
 * Description: Integrate Nanhi.Links URL shortening service directly into your WordPress site. Create, manage, and track short links without leaving your dashboard.
 * Version: 1.0.0
 * Author: Nanhi.Links Team
 * Author URI: https://nanhi.link
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: nanhi-links
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('NANHI_LINKS_VERSION', '1.0.0');
define('NANHI_LINKS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NANHI_LINKS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('NANHI_LINKS_API_BASE', 'https://api.nanhi.link/api');

/**
 * Main Nanhi Links Plugin Class
 */
class NanhiLinksPlugin {
    
    /**
     * Instance of this class
     */
    private static $instance = null;
    
    /**
     * API client instance
     */
    private $api_client = null;
    
    /**
     * Get singleton instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain
        load_plugin_textdomain('nanhi-links', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Initialize API client
        $this->api_client = new NanhiLinksAPIClient();
        
        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
            add_action('wp_ajax_nanhi_links_create', array($this, 'ajax_create_link'));
            add_action('wp_ajax_nanhi_links_get_links', array($this, 'ajax_get_links'));
            add_action('wp_ajax_nanhi_links_delete_link', array($this, 'ajax_delete_link'));
            add_action('wp_ajax_nanhi_links_test_connection', array($this, 'ajax_test_connection'));
        }
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_shortcode('nanhi_link', array($this, 'shortcode_nanhi_link'));
        
        // Post editor integration
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_post_meta'));
        
        // Settings
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Create database table for local link cache
        $this->create_links_table();
        
        // Set default options
        add_option('nanhi_links_api_key', '');
        add_option('nanhi_links_auto_shorten', false);
        add_option('nanhi_links_default_project', '');
        add_option('nanhi_links_track_internal', false);
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Clean up scheduled events
        wp_clear_scheduled_hook('nanhi_links_sync_stats');
    }
    
    /**
     * Create links table
     */
    private function create_links_table() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'nanhi_links';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            nanhi_id varchar(255) NOT NULL,
            post_id bigint(20) DEFAULT NULL,
            original_url text NOT NULL,
            short_code varchar(50) NOT NULL,
            short_url varchar(255) NOT NULL,
            title varchar(255) DEFAULT NULL,
            click_count int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY nanhi_id (nanhi_id),
            UNIQUE KEY short_code (short_code),
            KEY post_id (post_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Nanhi.Links', 'nanhi-links'),
            __('Nanhi.Links', 'nanhi-links'),
            'manage_options',
            'nanhi-links',
            array($this, 'admin_page'),
            'dashicons-admin-links',
            30
        );
        
        add_submenu_page(
            'nanhi-links',
            __('All Links', 'nanhi-links'),
            __('All Links', 'nanhi-links'),
            'manage_options',
            'nanhi-links',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'nanhi-links',
            __('Create Link', 'nanhi-links'),
            __('Create Link', 'nanhi-links'),
            'manage_options',
            'nanhi-links-create',
            array($this, 'create_link_page')
        );
        
        add_submenu_page(
            'nanhi-links',
            __('Analytics', 'nanhi-links'),
            __('Analytics', 'nanhi-links'),
            'manage_options',
            'nanhi-links-analytics',
            array($this, 'analytics_page')
        );
        
        add_submenu_page(
            'nanhi-links',
            __('Settings', 'nanhi-links'),
            __('Settings', 'nanhi-links'),
            'manage_options',
            'nanhi-links-settings',
            array($this, 'settings_page')
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'nanhi-links') !== false) {
            wp_enqueue_script(
                'nanhi-links-admin',
                NANHI_LINKS_PLUGIN_URL . 'assets/js/admin.js',
                array('jquery'),
                NANHI_LINKS_VERSION,
                true
            );
            
            wp_enqueue_style(
                'nanhi-links-admin',
                NANHI_LINKS_PLUGIN_URL . 'assets/css/admin.css',
                array(),
                NANHI_LINKS_VERSION
            );
            
            wp_localize_script('nanhi-links-admin', 'nanhiLinks', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('nanhi_links_nonce'),
                'strings' => array(
                    'confirmDelete' => __('Are you sure you want to delete this link?', 'nanhi-links'),
                    'copied' => __('Copied to clipboard!', 'nanhi-links'),
                    'error' => __('An error occurred. Please try again.', 'nanhi-links')
                )
            ));
        }
    }
    
    /**
     * Enqueue frontend scripts
     */
    public function enqueue_frontend_scripts() {
        wp_enqueue_script(
            'nanhi-links-frontend',
            NANHI_LINKS_PLUGIN_URL . 'assets/js/frontend.js',
            array('jquery'),
            NANHI_LINKS_VERSION,
            true
        );
        
        wp_enqueue_style(
            'nanhi-links-frontend',
            NANHI_LINKS_PLUGIN_URL . 'assets/css/frontend.css',
            array(),
            NANHI_LINKS_VERSION
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('nanhi_links_settings', 'nanhi_links_api_key');
        register_setting('nanhi_links_settings', 'nanhi_links_auto_shorten');
        register_setting('nanhi_links_settings', 'nanhi_links_default_project');
        register_setting('nanhi_links_settings', 'nanhi_links_track_internal');
    }
    
    /**
     * Main admin page
     */
    public function admin_page() {
        include NANHI_LINKS_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    /**
     * Create link page
     */
    public function create_link_page() {
        include NANHI_LINKS_PLUGIN_PATH . 'templates/create-link-page.php';
    }
    
    /**
     * Analytics page
     */
    public function analytics_page() {
        include NANHI_LINKS_PLUGIN_PATH . 'templates/analytics-page.php';
    }
    
    /**
     * Settings page
     */
    public function settings_page() {
        include NANHI_LINKS_PLUGIN_PATH . 'templates/settings-page.php';
    }
    
    /**
     * Add meta boxes
     */
    public function add_meta_boxes() {
        add_meta_box(
            'nanhi-links-meta',
            __('Nanhi.Links', 'nanhi-links'),
            array($this, 'meta_box_callback'),
            array('post', 'page'),
            'side',
            'default'
        );
    }
    
    /**
     * Meta box callback
     */
    public function meta_box_callback($post) {
        wp_nonce_field('nanhi_links_meta_nonce', 'nanhi_links_meta_nonce');
        
        $short_link = get_post_meta($post->ID, '_nanhi_short_link', true);
        $auto_create = get_post_meta($post->ID, '_nanhi_auto_create', true);
        
        include NANHI_LINKS_PLUGIN_PATH . 'templates/meta-box.php';
    }
    
    /**
     * Save post meta
     */
    public function save_post_meta($post_id) {
        if (!isset($_POST['nanhi_links_meta_nonce']) || 
            !wp_verify_nonce($_POST['nanhi_links_meta_nonce'], 'nanhi_links_meta_nonce')) {
            return;
        }
        
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Auto-create short link if enabled
        if (isset($_POST['nanhi_auto_create']) && $_POST['nanhi_auto_create'] === '1') {
            $this->auto_create_link_for_post($post_id);
        }
        
        update_post_meta($post_id, '_nanhi_auto_create', isset($_POST['nanhi_auto_create']) ? '1' : '0');
    }
    
    /**
     * Auto-create link for post
     */
    private function auto_create_link_for_post($post_id) {
        $post = get_post($post_id);
        if (!$post || $post->post_status !== 'publish') {
            return;
        }
        
        $existing_link = get_post_meta($post_id, '_nanhi_short_link', true);
        if ($existing_link) {
            return; // Link already exists
        }
        
        $post_url = get_permalink($post_id);
        $post_title = get_the_title($post_id);
        
        $link_data = array(
            'url' => $post_url,
            'title' => $post_title,
            'description' => sprintf(__('Short link for: %s', 'nanhi-links'), $post_title)
        );
        
        $default_project = get_option('nanhi_links_default_project');
        if ($default_project) {
            $link_data['project_id'] = $default_project;
        }
        
        $result = $this->api_client->create_link($link_data);
        
        if ($result && !is_wp_error($result)) {
            update_post_meta($post_id, '_nanhi_short_link', $result['short_url']);
            update_post_meta($post_id, '_nanhi_link_id', $result['id']);
            
            // Save to local cache
            $this->save_link_to_cache($result, $post_id);
        }
    }
    
    /**
     * Save link to local cache
     */
    private function save_link_to_cache($link_data, $post_id = null) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'nanhi_links';
        
        $wpdb->insert(
            $table_name,
            array(
                'nanhi_id' => $link_data['id'],
                'post_id' => $post_id,
                'original_url' => $link_data['url'],
                'short_code' => $link_data['short_code'],
                'short_url' => $link_data['short_url'],
                'title' => $link_data['title'],
                'click_count' => 0
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s', '%d')
        );
    }
    
    /**
     * Shortcode handler
     */
    public function shortcode_nanhi_link($atts) {
        $atts = shortcode_atts(array(
            'url' => '',
            'text' => '',
            'title' => '',
            'class' => '',
            'target' => '_blank'
        ), $atts);
        
        if (empty($atts['url'])) {
            return '';
        }
        
        // Check if it's already a short link
        if (strpos($atts['url'], 'nanhi.link') !== false) {
            $short_url = $atts['url'];
        } else {
            // Create short link
            $link_data = array(
                'url' => $atts['url'],
                'title' => $atts['title'] ?: $atts['text']
            );
            
            $result = $this->api_client->create_link($link_data);
            
            if ($result && !is_wp_error($result)) {
                $short_url = $result['short_url'];
                $this->save_link_to_cache($result);
            } else {
                $short_url = $atts['url']; // Fallback to original URL
            }
        }
        
        $link_text = $atts['text'] ?: $short_url;
        $class = $atts['class'] ? ' class="' . esc_attr($atts['class']) . '"' : '';
        $target = $atts['target'] ? ' target="' . esc_attr($atts['target']) . '"' : '';
        
        return sprintf(
            '<a href="%s"%s%s>%s</a>',
            esc_url($short_url),
            $class,
            $target,
            esc_html($link_text)
        );
    }
    
    /**
     * AJAX: Create link
     */
    public function ajax_create_link() {
        check_ajax_referer('nanhi_links_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'nanhi-links'));
        }
        
        $url = sanitize_url($_POST['url']);
        $title = sanitize_text_field($_POST['title']);
        $custom_code = sanitize_text_field($_POST['custom_code']);
        
        if (empty($url)) {
            wp_send_json_error(__('URL is required', 'nanhi-links'));
        }
        
        $link_data = array(
            'url' => $url,
            'title' => $title
        );
        
        if (!empty($custom_code)) {
            $link_data['custom_code'] = $custom_code;
        }
        
        $result = $this->api_client->create_link($link_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        if ($result) {
            $this->save_link_to_cache($result);
            wp_send_json_success($result);
        } else {
            wp_send_json_error(__('Failed to create link', 'nanhi-links'));
        }
    }
    
    /**
     * AJAX: Get links
     */
    public function ajax_get_links() {
        check_ajax_referer('nanhi_links_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'nanhi-links'));
        }
        
        $page = intval($_POST['page']) ?: 1;
        $search = sanitize_text_field($_POST['search']);
        
        $params = array('page' => $page, 'limit' => 20);
        if ($search) {
            $params['search'] = $search;
        }
        
        $result = $this->api_client->get_links($params);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * AJAX: Delete link
     */
    public function ajax_delete_link() {
        check_ajax_referer('nanhi_links_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'nanhi-links'));
        }
        
        $link_id = sanitize_text_field($_POST['link_id']);
        
        if (empty($link_id)) {
            wp_send_json_error(__('Link ID is required', 'nanhi-links'));
        }
        
        $result = $this->api_client->delete_link($link_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        // Remove from local cache
        global $wpdb;
        $table_name = $wpdb->prefix . 'nanhi_links';
        $wpdb->delete($table_name, array('nanhi_id' => $link_id), array('%s'));
        
        wp_send_json_success(__('Link deleted successfully', 'nanhi-links'));
    }
    
    /**
     * AJAX: Test connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('nanhi_links_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'nanhi-links'));
        }
        
        $api_key = sanitize_text_field($_POST['api_key']);
        
        if (empty($api_key)) {
            wp_send_json_error(__('API key is required', 'nanhi-links'));
        }
        
        $test_client = new NanhiLinksAPIClient($api_key);
        $result = $test_client->test_connection();
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }
        
        wp_send_json_success(__('Connection successful!', 'nanhi-links'));
    }
}

/**
 * Nanhi Links API Client
 */
class NanhiLinksAPIClient {
    
    private $api_key;
    private $base_url;
    
    public function __construct($api_key = null) {
        $this->api_key = $api_key ?: get_option('nanhi_links_api_key');
        $this->base_url = NANHI_LINKS_API_BASE;
    }
    
    /**
     * Make API request
     */
    private function make_request($endpoint, $method = 'GET', $data = null) {
        if (empty($this->api_key)) {
            return new WP_Error('no_api_key', __('API key not configured', 'nanhi-links'));
        }
        
        $url = $this->base_url . '/' . ltrim($endpoint, '/');
        
        $args = array(
            'method' => $method,
            'headers' => array(
                'X-API-Key' => $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'timeout' => 30
        );
        
        if ($data && in_array($method, array('POST', 'PUT', 'PATCH'))) {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($status_code >= 400) {
            $error_message = isset($data['error']) ? $data['error'] : __('API request failed', 'nanhi-links');
            return new WP_Error('api_error', $error_message);
        }
        
        return $data;
    }
    
    /**
     * Test API connection
     */
    public function test_connection() {
        return $this->make_request('health');
    }
    
    /**
     * Create link
     */
    public function create_link($data) {
        return $this->make_request('links', 'POST', $data);
    }
    
    /**
     * Get links
     */
    public function get_links($params = array()) {
        $query_string = http_build_query($params);
        $endpoint = 'links' . ($query_string ? '?' . $query_string : '');
        return $this->make_request($endpoint);
    }
    
    /**
     * Get specific link
     */
    public function get_link($id) {
        return $this->make_request('links/' . $id);
    }
    
    /**
     * Update link
     */
    public function update_link($id, $data) {
        return $this->make_request('links/' . $id, 'PUT', $data);
    }
    
    /**
     * Delete link
     */
    public function delete_link($id) {
        return $this->make_request('links/' . $id, 'DELETE');
    }
    
    /**
     * Get link analytics
     */
    public function get_link_analytics($id, $period = '7d') {
        return $this->make_request('links/' . $id . '/analytics?period=' . $period);
    }
    
    /**
     * Get user statistics
     */
    public function get_stats() {
        return $this->make_request('stats');
    }
    
    /**
     * Get projects
     */
    public function get_projects() {
        return $this->make_request('projects');
    }
}

// Initialize plugin
NanhiLinksPlugin::get_instance();

/**
 * Helper functions
 */

/**
 * Get Nanhi Links API client instance
 */
function nanhi_links_api() {
    return new NanhiLinksAPIClient();
}

/**
 * Create a short link programmatically
 */
function nanhi_create_short_link($url, $args = array()) {
    $api = nanhi_links_api();
    
    $data = array_merge(array(
        'url' => $url
    ), $args);
    
    return $api->create_link($data);
}

/**
 * Get short link for a post
 */
function nanhi_get_post_short_link($post_id) {
    return get_post_meta($post_id, '_nanhi_short_link', true);
}

/**
 * Display short link button
 */
function nanhi_short_link_button($url, $text = null, $class = '') {
    if (!$text) {
        $text = __('Get Short Link', 'nanhi-links');
    }
    
    $class = $class ? ' ' . $class : '';
    
    echo sprintf(
        '<button class="nanhi-short-link-btn%s" data-url="%s">%s</button>',
        esc_attr($class),
        esc_attr($url),
        esc_html($text)
    );
}
?>
