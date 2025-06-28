/**
 * Nanhi.Links WordPress Plugin Admin JavaScript
 */

(function($) {
    'use strict';

    // Global variables
    let currentPage = 1;
    let isLoading = false;
    let searchTimeout;

    // Initialize when document is ready
    $(document).ready(function() {
        initializeAdmin();
    });

    /**
     * Initialize admin functionality
     */
    function initializeAdmin() {
        // Load initial links if on main page
        if ($('#nanhi-links-container').length) {
            loadLinks();
        }

        // Bind event handlers
        bindEventHandlers();
    }

    /**
     * Bind all event handlers
     */
    function bindEventHandlers() {
        // Search functionality
        $('#nanhi-search').on('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                currentPage = 1;
                loadLinks();
            }, 500);
        });

        // Copy to clipboard
        $(document).on('click', '.nanhi-copy-btn', function(e) {
            e.preventDefault();
            const url = $(this).data('url');
            copyToClipboard(url, $(this));
        });

        // Delete link
        $(document).on('click', '.nanhi-delete-btn', function(e) {
            e.preventDefault();
            const linkId = $(this).data('id');
            const linkItem = $(this).closest('.nanhi-link-item');
            deleteLink(linkId, linkItem);
        });

        // Analytics button
        $(document).on('click', '.nanhi-analytics-btn', function(e) {
            e.preventDefault();
            const linkId = $(this).data('id');
            showAnalytics(linkId);
        });

        // Edit button
        $(document).on('click', '.nanhi-edit-btn', function(e) {
            e.preventDefault();
            const linkId = $(this).data('id');
            editLink(linkId);
        });

        // Test connection
        $('#nanhi-test-connection').on('click', function(e) {
            e.preventDefault();
            testConnection();
        });

        // Pagination
        $(document).on('click', '.nanhi-page-btn', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            if (page !== currentPage && !isLoading) {
                currentPage = page;
                loadLinks();
            }
        });

        // Create link form (if on create page)
        $('#nanhi-create-form').on('submit', function(e) {
            e.preventDefault();
            createLink();
        });
    }

    /**
     * Load links from API
     */
    function loadLinks() {
        if (isLoading) return;

        isLoading = true;
        const container = $('#nanhi-links-container');
        const search = $('#nanhi-search').val();

        // Show loading state
        container.html('<div class="nanhi-loading"><span class="spinner is-active"></span>' + 
                      nanhiLinks.strings.loading + '</div>');

        const data = {
            action: 'nanhi_links_get_links',
            nonce: nanhiLinks.nonce,
            page: currentPage,
            search: search
        };

        $.post(nanhiLinks.ajaxUrl, data)
            .done(function(response) {
                if (response.success) {
                    renderLinks(response.data.links);
                    renderPagination(response.data.pagination);
                } else {
                    showError(response.data || nanhiLinks.strings.error);
                }
            })
            .fail(function() {
                showError(nanhiLinks.strings.error);
            })
            .always(function() {
                isLoading = false;
            });
    }

    /**
     * Render links in the container
     */
    function renderLinks(links) {
        const container = $('#nanhi-links-container');
        const template = $('#nanhi-link-template').html();

        if (!links || links.length === 0) {
            container.html('<div class="nanhi-empty">' +
                          '<span class="dashicons dashicons-admin-links"></span>' +
                          '<p>No links found. <a href="' + 
                          nanhiLinks.createUrl + '">Create your first link</a>.</p>' +
                          '</div>');
            return;
        }

        let html = '';
        links.forEach(function(link) {
            let linkHtml = template;
            
            // Replace template variables
            linkHtml = linkHtml.replace(/\{\{id\}\}/g, link.id);
            linkHtml = linkHtml.replace(/\{\{title\}\}/g, escapeHtml(link.title || 'Untitled'));
            linkHtml = linkHtml.replace(/\{\{url\}\}/g, escapeHtml(link.url));
            linkHtml = linkHtml.replace(/\{\{short_url\}\}/g, escapeHtml(link.short_url));
            linkHtml = linkHtml.replace(/\{\{click_count\}\}/g, link.click_count || 0);
            linkHtml = linkHtml.replace(/\{\{created_date\}\}/g, formatDate(link.created_at));

            html += linkHtml;
        });

        container.html(html);
    }

    /**
     * Render pagination
     */
    function renderPagination(pagination) {
        const container = $('#nanhi-pagination');
        
        if (!pagination || pagination.pages <= 1) {
            container.empty();
            return;
        }

        let html = '';
        
        // Previous button
        if (pagination.page > 1) {
            html += '<button class="button nanhi-page-btn" data-page="' + 
                   (pagination.page - 1) + '">« Previous</button>';
        }

        // Page numbers
        const startPage = Math.max(1, pagination.page - 2);
        const endPage = Math.min(pagination.pages, pagination.page + 2);

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === pagination.page;
            html += '<button class="button ' + (isActive ? 'button-primary' : '') + 
                   ' nanhi-page-btn" data-page="' + i + '">' + i + '</button>';
        }

        // Next button
        if (pagination.page < pagination.pages) {
            html += '<button class="button nanhi-page-btn" data-page="' + 
                   (pagination.page + 1) + '">Next »</button>';
        }

        container.html(html);
    }

    /**
     * Copy URL to clipboard
     */
    function copyToClipboard(url, button) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() {
                showCopyFeedback(button);
            }).catch(function() {
                fallbackCopyToClipboard(url, button);
            });
        } else {
            fallbackCopyToClipboard(url, button);
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    function fallbackCopyToClipboard(url, button) {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyFeedback(button);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show copy feedback
     */
    function showCopyFeedback(button) {
        button.addClass('copied');
        setTimeout(function() {
            button.removeClass('copied');
        }, 2000);
        
        // Show toast notification if available
        if (typeof wp !== 'undefined' && wp.data) {
            wp.data.dispatch('core/notices').createNotice(
                'success',
                nanhiLinks.strings.copied,
                { isDismissible: true, type: 'snackbar' }
            );
        }
    }

    /**
     * Delete a link
     */
    function deleteLink(linkId, linkItem) {
        if (!confirm(nanhiLinks.strings.confirmDelete)) {
            return;
        }

        linkItem.css('opacity', '0.5');

        const data = {
            action: 'nanhi_links_delete_link',
            nonce: nanhiLinks.nonce,
            link_id: linkId
        };

        $.post(nanhiLinks.ajaxUrl, data)
            .done(function(response) {
                if (response.success) {
                    linkItem.fadeOut(300, function() {
                        $(this).remove();
                        
                        // Reload if no links left on page
                        if ($('.nanhi-link-item').length === 0) {
                            loadLinks();
                        }
                    });
                } else {
                    linkItem.css('opacity', '1');
                    alert(response.data || nanhiLinks.strings.error);
                }
            })
            .fail(function() {
                linkItem.css('opacity', '1');
                alert(nanhiLinks.strings.error);
            });
    }

    /**
     * Show analytics for a link
     */
    function showAnalytics(linkId) {
        // For now, redirect to analytics page
        // In future versions, this could open a modal
        window.open(nanhiLinks.analyticsUrl + '?link_id=' + linkId, '_blank');
    }

    /**
     * Edit a link
     */
    function editLink(linkId) {
        // For now, redirect to edit page
        // In future versions, this could open a modal
        window.location.href = nanhiLinks.editUrl + '?link_id=' + linkId;
    }

    /**
     * Test API connection
     */
    function testConnection() {
        const button = $('#nanhi-test-connection');
        const status = $('#nanhi-connection-status');
        const apiKey = $('#nanhi_links_api_key').val();

        if (!apiKey) {
            status.removeClass('success').addClass('error')
                  .text('Please enter an API key first.').show();
            return;
        }

        button.prop('disabled', true).text('Testing...');
        status.hide();

        const data = {
            action: 'nanhi_links_test_connection',
            nonce: nanhiLinks.nonce,
            api_key: apiKey
        };

        $.post(nanhiLinks.ajaxUrl, data)
            .done(function(response) {
                if (response.success) {
                    status.removeClass('error').addClass('success')
                          .text(response.data).show();
                } else {
                    status.removeClass('success').addClass('error')
                          .text(response.data || 'Connection failed.').show();
                }
            })
            .fail(function() {
                status.removeClass('success').addClass('error')
                      .text('Connection failed.').show();
            })
            .always(function() {
                button.prop('disabled', false).text('Test Connection');
            });
    }

    /**
     * Create a new link
     */
    function createLink() {
        const form = $('#nanhi-create-form');
        const button = form.find('input[type="submit"]');
        const originalText = button.val();

        button.prop('disabled', true).val('Creating...');

        const data = {
            action: 'nanhi_links_create',
            nonce: nanhiLinks.nonce,
            url: form.find('#nanhi-url').val(),
            title: form.find('#nanhi-title').val(),
            custom_code: form.find('#nanhi-custom-code').val()
        };

        $.post(nanhiLinks.ajaxUrl, data)
            .done(function(response) {
                if (response.success) {
                    // Show success message
                    form.before('<div class="notice notice-success"><p>Link created successfully! ' +
                               '<a href="' + response.data.short_url + '" target="_blank">' +
                               response.data.short_url + '</a></p></div>');
                    
                    // Reset form
                    form[0].reset();
                    
                    // Scroll to top
                    $('html, body').animate({ scrollTop: 0 }, 300);
                } else {
                    alert(response.data || nanhiLinks.strings.error);
                }
            })
            .fail(function() {
                alert(nanhiLinks.strings.error);
            })
            .always(function() {
                button.prop('disabled', false).val(originalText);
            });
    }

    /**
     * Show error message
     */
    function showError(message) {
        const container = $('#nanhi-links-container');
        container.html('<div class="nanhi-error">' +
                      '<span class="dashicons dashicons-warning"></span>' +
                      '<p>' + escapeHtml(message) + '</p>' +
                      '</div>');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '<',
            '>': '>',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return diffDays + ' days ago';
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Debounce function
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Export functions for external use
    window.nanhiLinksAdmin = {
        loadLinks: loadLinks,
        copyToClipboard: copyToClipboard,
        deleteLink: deleteLink,
        testConnection: testConnection
    };

})(jQuery);
