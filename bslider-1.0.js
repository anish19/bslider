(function () {
    __extend_parent__ = function(child, parent) { 
        _.each(_.keys(parent), function (key) {
            if (_.has(parent, key)) {
                child[key] = parent[key];
            }
        });

        function Klass() { 
            this.constructor = child; 
        } 
        Klass.prototype = parent.prototype; 
        child.prototype = new Klass(); 
    };

    if (typeof Backbone === "undefined" || Backbone === null) {
        throw new Error('This plugin requires the latest version of Backbone. Can be found at http://documentcloud.github.com/backbone/backbone.js');
    }

    if (typeof jQuery === "undefined") {
        throw new Error('This plugin requires jQuery version 1.10.2 and above. Can be found at http://jquery.com');
    }
    
    if (typeof $.ui === "undefined") {
        throw new Error('This plugin requires jQuery-ui version 1.10.3. Can be found at http://jqueryui.com');
    }

    Backbone.Slider = (function(_super) {
        __extend_parent__(Slider, _super);

        var throttleTime;

        Slider.prototype.className = 'bslider';

        function Slider() {
            this.args = Array.prototype.slice.apply(arguments);
            Backbone.View.prototype.constructor.apply(this, this.args);
            Backbone.View.prototype.delegateEvents.apply(this, this.args);
            this.initialize();
        }

        Slider.prototype.initialize = function () {
            this.views = this.views || [];
            this.crossLinkTitles = this.crossLinkTitles || {};
            this.cycleThrough = this.cycleThrough || false;
            this.preTransition = _.isFunction(this.preTransition) ? this.preTransition : function () {};
            this.postTransition = _.isFunction(this.postTransition) ? this.postTransition : function () {};
            this.slideTransitionDuration = this.slideTransitionDuration || 500;
            throttleTime = this.slideTransitionDuration + 100;

            if (_(this.views).some(isNotABackboneView)) {
                throwError('Cannot initilize slider. Nothing other than backbone views are supported for now');
            }

            this.currentIndex = -1;
            this.currentView = -1;
        };

        function isNotABackboneView (view) {
            return !(view instanceof Backbone.View);
        }

        function throwError (message) {
            throw new Error(message);
        }

        Slider.prototype.addViews = function(viewsToAdd) {
            var self = this;
            if (!_.isArray(viewsToAdd) || !exists(viewsToAdd)) {
                throwError('Error adding views ' + viewsToAdd);
            }
            _.each(viewsToAdd, function (view) {
                if (isNotABackboneView(view)) {
                    throwError('One of the added views is not a backbone view');
                }
                self.views.push(view);
            });
        };

        Slider.prototype.setupEventHandlers = function () {
            var self = this;
            this.navigateLeft = _.throttle(
                    _.wrap(this.navigateLeft, function(navLeft) {
                        self.preTransition(); 
                        navLeft(self); 
                        self.postTransition();
                    }), throttleTime);

            this.navigateRight = _.throttle(
                    _.wrap(this.navigateRight, function(navRight) {
                        self.preTransition(); 
                        navRight(self); 
                        self.postTransition();
                    }), throttleTime);

            this.$('.bslider-nav-left').on('click', this.navigateLeft);
            this.$('.bslider-nav-right').on('click', this.navigateRight);
        };

        Slider.prototype.render = function (options) {
            var navContainerLeft = $('<div />').addClass('bslider-nav-container-left');
                navContainerRight = $('<div />').addClass('bslider-nav-container-right');

            if (!exists(options)) {
                options = {};
            }

            this.sliderContainer = $('<div></div>').addClass('bslider-container');
            this.navLeft = $('<i />').addClass('bslider-nav-left').addClass('icon-circle-arrow-left');
            this.navRight = $('<i />').addClass('bslider-nav-right').addClass('icon-circle-arrow-right');

            this.$el.html(this.sliderContainer);

            this.$el.prepend(navContainerLeft.append(this.navLeft));
            this.$el.append(navContainerRight.append(this.navRight));

            if (this.enableCrossLinks) {
                this.createCrossLinks();
            }

            if (this.initialViewToBeRendered) {
                this.renderViewAt(this.initialViewToBeRendered);
            } else {
                this.renderFirstView();
            }

            this.setupEventHandlers();


            return this;
        };

        Slider.prototype.createCrossLinks  = function () {
            var self = this;
            this.crossLinkCount = 0;
            this.crossLinksContainer = $('<div />').addClass('cross-links');
            this.$el.append(this.crossLinksContainer);
            this.viewCrossLinkMap = {};
            this.crossLinks = [];

            _(this.views).each(this.createCrossLink, this);

            this.$('.cross-link').on('click', function (e) {
                self.navigateTo(e);
            });
        };

        Slider.prototype.createCrossLink = function (view) {
            var crossLinkId = 'bsliderCrossLink' + this.crossLinkCount++,
                crossLink = $('<div />').addClass('cross-link').attr('id', crossLinkId).addClass('unselected');
            
            crossLink.text(view.bsliderCrossLinkTitle ? view.bsliderCrossLinkTitle : 'View ' + this.crossLinkCount);

            this.crossLinksContainer.append(crossLink);
            this.crossLinks.push(crossLink);
            _.extend(this.viewCrossLinkMap, _.object([crossLinkId], [view]));
        };
        
        Slider.prototype.navigateTo = function(e) {
            var viewId = e.currentTarget.id,
                viewToRender = _.result(this.viewCrossLinkMap, viewId);


            if (exists(viewToRender)) {
                var viewToRemove = this.getCurrentView();

                //Animate like nav left
                if (this.views.indexOf(viewToRender) < this.views.indexOf(viewToRemove)) {
                    this.renderNewAndRemoveOld(viewToRender, viewToRemove, 'left');
                }

                //Animate like nav right
                else if (this.views.indexOf(viewToRender) > this.views.indexOf(viewToRemove)) {
                    this.renderNewAndRemoveOld(viewToRender, viewToRemove, 'right');
                }

            }
        };

        Slider.prototype.renderNewAndRemoveOld  = function (newView, oldView, slideDirection) {
            var opposite = slideDirection === 'left' ? 'right' : 'left',
                self = this;
            $(newView.$el).css('display', 'none');
            $(newView.$el).insertAfter($(oldView.$el));
            $(newView.$el).addClass('top-most');
            $(oldView.$el).addClass('bottom-most');
            $(oldView.$el).hide('slide', {easing: 'easeInOutQuad', direction: opposite, queue: false}, this.slideTransitionDuration, function () {
                $(oldView.$el).removeClass('bottom-most');
                $(oldView.$el).remove();
            });
            this.currentView = _.indexOf(this.views, newView);
            $(newView.$el).show('slide', {easing: 'easeInOutQuad', direction: slideDirection, queue: false}, this.slideTransitionDuration, function () {
                $(newView.$el).removeClass('top-most');
                self.currentIndex = _.indexOf(self.views, self.getCurrentView());
                self.updateCrossLinks();
            });
        };

        Slider.prototype.updateCrossLinks = function () {
            if (this.enableCrossLinks) {
                var currentCrossLink = this.crossLinks[_.indexOf(this.views, this.getCurrentView())];
                _.each(this.crossLinks, function (link) {
                    if (link === currentCrossLink) {
                        link.addClass('selected').removeClass('unselected');
                    } else {
                        link.addClass('unselected').removeClass('selected');
                    }
                });
            }
        };

        Slider.prototype.navigateLeft = function (context) {
            var viewToRender = context.getViewAt(--context.currentIndex);
            if (exists(viewToRender)) {
                var viewToRemove = context.getCurrentView();
                context.renderNewAndRemoveOld(viewToRender, viewToRemove, 'left');
            }
        };

        Slider.prototype.navigateRight = function (context) {
            var viewToRender = context.getViewAt(++context.currentIndex);
            if (exists(viewToRender)) {
                var viewToRemove = context.getCurrentView();
                context.renderNewAndRemoveOld(viewToRender, viewToRemove, 'right');
            }
        };

        Slider.prototype.renderViewAt  = function (index) {
            var viewToBeRendered = this.getViewAt(index);
            if (viewToBeRendered) {
                this.currentView = index;
                this.sliderContainer.append(viewToBeRendered.el);
                this.updateCrossLinks();
            }
        };

        Slider.prototype.getCurrentView = function () {
            return this.views[this.currentView];
        };

        Slider.prototype.getViewAt  = function (index) {
            if (!this.views.length || (!this.cycleThrough && (index >= this.views.length || index < 0))) {
                if (index >= this.views.length) {
                    this.currentIndex = this.views.length - 1;
                    this.currentView = this.currentIndex;
                } else if (index < 0){
                    this.currentIndex = 0;
                    this.currentView = this.currentIndex;
                }
                return undefined;
            } else {
                if (index >= this.views.length) {
                    this.currentIndex = 0;
                } else if (index < 0){
                    this.currentIndex = this.views.length - 1;
                } else {
                    this.currentIndex = index;
                }

                return this.views[this.currentIndex];
            }

        };

        Slider.prototype.renderFirstView = function () {
            if (!this.views.length) {
                throwError('Cannot render the slider. Need at least one view');
            }

            this.currentView = 0;
            this.sliderContainer.append(this.getViewAt(0).el);
            this.updateCrossLinks();
        };

        function exists(value) {
            return value != null;
        }

        return Slider;
    })(Backbone.View);
}).call(this);
