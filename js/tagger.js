(function($, window, document, undefined) {
    // TODO: show/hide autocomplete, remote interface for get tags
    // Events, add, remove, maxTags, hasAutocomplete

    function Tagger(el, settings) {
        var _this = this,
            _tags = [],
            $el, $autocomplete, $placeholder, $liInput, $input,
            placeholder, autocomplete, _id, _type, _tagTpl, _itemTpl;

        $el         = $(el);

        _id         = $el.attr('id');
        _type       = $(el).attr('type') || 'text';

        _tagTpl     = '<li class="tagger-item-label">'+settings.tagTpl+'</li>';
        _itemTpl    = '<li class="tagger-item-item">'+settings.itemTpl+'</li>';

        $autocomplete   = $('<ul id="tagger-list-'+_id+'" class="tagger-list"></ul>');
        $placeholder    = $('<ul id="tagger-'+_id+'" class="tagger"><li class="tagger-item-input"><input type="text" placeholder="'+$el.attr('placeholder')+'"></li></ul>');

        $liInput    = $placeholder.find('.tagger-item-input');
        $input      = $liInput.find(':text');

        $el.attr('type', 'hidden');

        $autocomplete.appendTo($liInput);

        $input
            .on('keyup', function(e) {
                var val = $input.val().trim();

                _list(val);
            })
            .on('keydown', function(e) {
                var val = $input.val().trim();

                if((e.which === 9 || e.which === 13 || e.which === 188) && val) {
                    if (_this.add(val)) {
                        $input.val('');
                    }

                    e.preventDefault();
                }
            });

        $el.after($placeholder);

        var _list = function(val) {
            var tags = settings.tags.filter(function(v){ return v.indexOf(val) !== -1; }),
                $item,
                tag, i, l;

            $autocomplete.empty();

            for (i = 0, l = tags.length; i < l; i++) {
                tag = tags[i];

                $item = $(_itemTpl.replace('{{ title }}', tag))
                    .attr('tagger-val', tag)
                    .on('click', function(e) {
                        _this.remove($(this).parents('[tagger-val]').attr('tagger-val'));
                    });

                $autocomplete.append($item);
            }
        };

        var _updateVal = function() {
            $el.val(_tags.join(', '));
        };

        this.add = function(val) {
            var $tag;

            if (val && (settings.maxTags === false || settings.maxTags >= _tags.length) && _tags.indexOf(val) === -1) {
                _tags.push(val);

                $tag = $(_tagTpl.replace('{{ title }}', val))
                    .attr('tagger-val', val)
                    .on('click', '.tagger-item-label-close', function(e){
                        _this.remove($(this).parents('[tagger-val]').attr('tagger-val'));
                    });

                $liInput.before($tag);
                _updateVal();

                return true;
            } else {
                return false;
            }
        };

        this.remove = function(val) {
            var index;

            if ((index = _tags.indexOf(val)) !== -1) {
                $placeholder.find('[tagger-val="'+val+'"]').remove();
                _tags.splice(index, 1);
                _updateVal();
            }
        };

        this.destroy = function() {
            $el.attr('type', _type);
            $('#tagger-'+_id).remove();
        };
    }

    /**
     * Tagger
     * @param  Object params Config params
     * @return jQuery
     */
    $.fn.tagger = function(params) {
        params = params || {};

        if (typeof params === 'object') {
            var defaults = {
                tags:       [], // or function
                minDigits:  3,
                maxTags:    false,
                onlyInList: false,
                tagTpl:     '<span class="tagger-item-label-text">{{ title }}</span><button class="tagger-item-label-close">X</button>',
                itemTpl:     '{{ title }}'
            };

            var settings = $.extend(defaults, params);

            return $(this).each(function(){
                if ($(this).data('tagger') === undefined) {
                    $(this).data('tagger', new Tagger(this, settings));
                }
            });
        } else {
            var instance;
            var param = arguments[1];

            return $(this).each(function(){
                if ($(this).data('tagger') !== undefined) {
                    instance = $(this).data('tagger');
                    instance[params](param);
                }
            });
        }
    };
})(jQuery, window, document);
