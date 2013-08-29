(function () {
    __extend_parent__ = function(child, parent) { 
        _.each(_.keys(parent), function (key) {
            if (_.has(parent, key)) {
                child[key] = parent[key];
            }
        });

        function konstructor() { 
            this.constructor = child; 
        } 
        konstructor.prototype = parent.prototype; 
        child.prototype = new konstructor(); 
        child.__super__ = parent.prototype; 
        return child; 
    };

    if (typeof Backbone === "undefined" || Backbone === null) {
        throw new Error('Need the latest version of Backbone. Can be found at http://documentcloud.github.com/backbone/backbone.js');
    }

    Backbone.Slider = (function(_super) {
        __extend_parent__(Slider, _super);

        var __reference;

        Slider.prototype.className = 'easy-slider';

        function Slider() {
            __reference = this; //TODO find a better way

            this.args = Array.prototype.slice.apply(arguments);
            Backbone.View.prototype.constructor.apply(this, this.args);
            Backbone.View.prototype.delegateEvents.apply(this, this.args);
            this.initialize();
        }

        Slider.prototype.events = {
            'click .easy-slider-nav-left' : 'navigateLeft',
            'click .easy-slider-nav-right' : 'navigateRight'
        };

        Slider.prototype.initialize = function () {
            this.views = this.views || [];
            this.currentIndex = -1;
        };

        Slider.prototype.addView = function(viewsToAdd) {
            var self = this;

            if (!_.isArray(viewsToAdd) || viewsToAdd === null || viewsToAdd === 'undefined') {
                throw new Error('Error adding views ' + views);
            }
            _.each(viewsToAdd, function (view) {
                self.views.push(view);
            });
        };

        Slider.prototype.delegateEvents = function () {
            this.$('.easy-slider-nav-left').on('click', this.navigateLeft);
            this.$('.easy-slider-nav-right').on('click', this.navigateRight);
        };

        Slider.prototype.render = function (options) {
            var navContainerLeft = $('<div />').addClass('easy-slider-nav-container-left');
                navContainerRight = $('<div />').addClass('easy-slider-nav-container-right');

            if (options === null) {
                options = {};
            }

            this.sliderContainer = $('<div></div>').addClass('easy-slider-container');
            this.navLeft = $('<i />').addClass('easy-slider-nav-left').addClass('icon-circle-arrow-left');
            this.navRight = $('<i />').addClass('easy-slider-nav-right').addClass('icon-circle-arrow-right');

            if (this.template) {
                this.sliderContainer.html(this.template());
            }

            this.$el.html(this.sliderContainer);

            //TODO not the best way to do this. Find a better way
            this.$el.prepend(navContainerLeft.append(this.navLeft));
            this.$el.append(navContainerRight.append(this.navRight));

            if (this.initialViewToBeRendered) {
                this.renderViewAt(this.initialViewToBeRendered);
            } else {
                this.renderFirstView();
            }

            return this;
        };

        Slider.prototype.navigateLeft = function () {
            var viewToRender = __reference.getViewAt(--__reference.currentIndex);
            if (typeof viewToRender !== 'undefined') {
                __reference.sliderContainer.empty();
                __reference.sliderContainer.append(viewToRender.el);
            }
        };

        Slider.prototype.navigateRight = function () {
            var viewToRender = __reference.getViewAt(++__reference.currentIndex);
            if (typeof viewToRender !== 'undefined') {
                __reference.sliderContainer.empty();
                __reference.sliderContainer.append(viewToRender.el);
            }
        };

        Slider.prototype.renderViewAt = function (index) {
            var viewToBeRendered = this.getViewAt(index);
            if (viewToBeRendered) {
                this.sliderContainer.append(viewToBeRendered.el);
            }
        };

        Slider.prototype.getViewAt = function(index) {
            if (!this.views.length || index > this.views.length || index < 0) {
                if (index > this.views.length) {
                    --__reference.currentIndex;
                } else if (index < 0){
                    ++__reference.currentIndex;
                }
                return undefined;
            }

            this.currentIndex = index;
            return this.views[index];
        };

        Slider.prototype.renderFirstView = function renderFirstView() {
            var self = this;

            if (!this.views.length) {
                throw new Error('Cannot render the slider. Need at least one view');
            }

            this.sliderContainer.append(this.getViewAt(0).el);
        };

        return Slider;
    })(Backbone.View);
}).call(this);