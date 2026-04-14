/**
 * PERFORMANCE UTILITIES
 * Contains lazy loading, DOM optimization, and other performance helpers
 */

/**
 * Lazy Load Images
 * Loads images only when they come into the viewport
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach((img) => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Event Delegation
 * Attach event listeners to parent elements instead of individual elements
 * Reduces memory usage and improves performance
 */
function delegateEvent(parentSelector, eventType, childSelector, handler) {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;
    
    parent.addEventListener(eventType, (event) => {
        let target = event.target;
        while (target && target !== parent) {
            if (target.matches(childSelector)) {
                handler.call(target, event);
                return;
            }
            target = target.parentElement;
        }
    });
}

/**
 * Debounce Function
 * Prevents a function from being called too many times
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle Function
 * Ensures a function is called at most once per time interval
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request Animation Frame Batch
 * Batches DOM operations to a single frame for better performance
 */
const rafBatch = {
    tasks: [],
    scheduled: false,
    
    add(task) {
        this.tasks.push(task);
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    },
    
    flush() {
        const tasks = this.tasks;
        this.tasks = [];
        this.scheduled = false;
        tasks.forEach(task => task());
    }
};

/**
 * Virtual Scrolling Helper
 * For rendering large lists efficiently
 */
class VirtualScroller {
    constructor(container, itemHeight, renderItem, totalItems) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.totalItems = totalItems;
        this.visibleItems = [];
        
        this.container.addEventListener('scroll', throttle(() => this.updateVisibleItems(), 100));
        this.updateVisibleItems();
    }
    
    updateVisibleItems() {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
        
        this.render(startIndex, Math.min(endIndex, this.totalItems));
    }
    
    render(startIndex, endIndex) {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.renderItem(i);
            if (item) {
                fragment.appendChild(item);
            }
        }
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}

/**
 * Intersection Observer for infinite scroll
 */
function setupInfiniteScroll(container, loadMoreCallback, options = {}) {
    const sentinel = document.createElement('div');
    container.appendChild(sentinel);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                loadMoreCallback();
            }
        });
    }, {
        threshold: 0.1,
        ...options
    });
    
    observer.observe(sentinel);
    return { observer, sentinel };
}

/**
 * Memory-efficient HTML updates
 * Use DocumentFragment to batch DOM manipulations
 */
function updateDOM(parentElement, items, renderItem) {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const element = renderItem(item);
        if (element) {
            fragment.appendChild(element);
        }
    });
    parentElement.appendChild(fragment);
}

/**
 * Optimize images with srcset
 * Example: <img src="small.jpg" srcset="medium.jpg 768w, large.jpg 1024w" alt="...">
 */
function optimizeImage(imgElement, baseUrl) {
    const srcset = imgElement.dataset.srcset;
    if (srcset) {
        imgElement.srcset = srcset;
    }
}

/**
 * Clear API request cache (for testing or manual refresh)
 */
function clearAPICache() {
    if (typeof requestCache !== 'undefined') {
        requestCache.clear();
        console.log('API cache cleared');
    }
}

/**
 * Performance monitoring
 */
const PerformanceMonitor = {
    marks: {},
    
    start(name) {
        this.marks[name] = performance.now();
    },
    
    end(name) {
        if (this.marks[name]) {
            const duration = performance.now() - this.marks[name];
            console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
            delete this.marks[name];
            return duration;
        }
    },
    
    measure(name, fn) {
        this.start(name);
        const result = fn();
        this.end(name);
        return result;
    },
    
    async measureAsync(name, asyncFn) {
        this.start(name);
        const result = await asyncFn();
        this.end(name);
        return result;
    }
};

/**
 * Initialize all performance optimizations
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing performance optimizations...');
    initLazyLoading();
    
    // Log Core Web Vitals when available
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    // Only log supported entry types
                    if (['largest-contentful-paint', 'first-input', 'navigation', 'resource'].includes(entry.entryType)) {
                        console.log(`📊 ${entry.name}: ${(entry.duration || 0).toFixed(0)}ms`);
                    }
                }
            });
            // Use supported entry types only
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'navigation', 'resource'] });
        } catch (e) {
            console.log('Performance monitoring not fully supported in this browser');
        }
    }
});
