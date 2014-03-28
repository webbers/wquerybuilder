;(function ( $, window, document, undefined ) {

    var pluginName = "wquerybuilder",
        defaults = {
            data: {}
        };

    var $selectboxTables, $selectboxTableColumns, $textareaQueryResult,
        $selectboxOptionsTag, $inputTextTop, $selectboxOrderby;
    var wquery = {
        from: [],
        field: [],
        distintic: {},
        join: {},
        left_join: {},
        right_join: {},
        group: {},
        order: null,
        limit: 0,
        where: {}
    };

    function Plugin ( element, options ) {
        this.element = element;
        this.DataTypes = {
            TABLE: { value: "table" },
            COLUMN: { value: "column" },
            LIMIT: { value: "limit" },
            ORDERBY: { value: "orderby" }
        };
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
            init: function () {
            $selectboxTables = $(this.element).find("[name='wtables']");
            $selectboxTableColumns = $(this.element).find("[name='wcolumns']");
            $selectboxOrderby = $(this.element).find("[name='worderby']");
            $textareaQueryResult = $(this.element).find("[name='wresult']");
            $selectboxOptionsTag = $(this.element).find("[name='worderby'],[name='wgroupby'],[name='wcolumncontent'],[name='wcolumnunion']");
            $inputTextTop = $(this.element).find("[name='wtop']");

            if(this.options.data) {
                try{
                    this.initTables(this.options.data);
                    this.initListeners(this.options.data);
                } catch(a){
                    alert("Error on initialize plugin");
                }
            }
        },
        initTables: function (data) {
            var options = "";
            for (var key in data){
                options += "<option value='" + key + "'>" + key + "</option>";
            }
            $selectboxTables.html(options);
        },
        initListeners: function (data){
            var self = this;
            $selectboxTables.on("change", function () {
                var val = $(this).val();
                self.executeQuery(self.DataTypes.TABLE, val);
                self.renderColumnsOptions(data, val);
            });

            $selectboxTableColumns.on("change",function(){
                var val = $(this).val();
                var unval = [];
                $.each($(this).find("option"), function () {
                    if (!$(this).prop("selected")){
                        unval.push($(this).val());
                    }
                    unval.push();
                });
                self.executeQuery(self.DataTypes.COLUMN, val, unval);
                self.renderOptions(data, val);
            });

            $selectboxOrderby.on("change", function(){
                var val = $(this).val();
                self.executeQuery(self.DataTypes.ORDERBY, val);
            });

            $inputTextTop.on("blur", function (){
                var val = parseInt($(this).val(), 10) || 0;
                self.executeQuery(self.DataTypes.LIMIT, val);
            });
        },
        renderColumnsOptions: function(data,val){
            var options = "";
            for (var key in data[val]){
                var selected = "";
                for (var i = 0; i < wquery.field.length; i++){
                    if (wquery.field[i].indexOf(val + "." + data[val][key]) > -1){
                        selected = "selected='selected'";
                        break;
                    }
                }
                var cval = val + "." + data[val][key];
                options += "<option " + selected + " value='" + cval + "'>" + data[val][key] + "</option>";
            }
            $selectboxTableColumns.html(options);
        },
        renderOptions: function (data) {
            var options = "<option></option>";
            for (var i = 0; i < wquery.from.length; i++) {
                var table = wquery.from[i];
                for (var j = 0; j < data[table].length; j++){
                    var field = table + "."+ data[table][j];
                    options += "<option value='" + field + "'>" + field + "</option>";
                }
            }
            $selectboxOptionsTag.html(options);
        },
        executeQuery: function (type, val, unval) {
            var str = "";
            switch (type) {
                case this.DataTypes.TABLE:
                    if (wquery.from.length <= 1 && wquery.field.length === 0){
                        wquery.from = [];
                        wquery.from.push(val);
                    }
                    break;

                case this.DataTypes.COLUMN:
                    if (val === null && wquery.from.length === 0) {
                        wquery.from = [];
                        wquery.from.push($selectboxTables.val());
                        wquery.field = [];
                        break;
                    }
                    if (val === null) {
                        wquery.from = _.difference(wquery.from, $selectboxTables.val());
                        if (wquery.from.length === 0){
                            wquery.from.push($selectboxTables.val());
                            wquery.field = [];
                            break;
                        }
                    }

                    if (_.findWhere(wquery.from, $selectboxTables.val()) === undefined && val !== null){
                        wquery.from = _.union(wquery.from, $selectboxTables.val());
                    }
                    wquery.field = _.union(wquery.field, val);
                    wquery.field = _.difference(wquery.field, unval);
                    wquery.field = _.compact(wquery.field);
                    break;

                case this.DataTypes.LIMIT:
                    wquery.limit = val;
                    break;

                case this.DataTypes.ORDERBY:
                    wquery.order = val;
                    break;

                default:
                    break;
            }

            for (var clause in wquery) {
                if ($.isArray(wquery[clause]) || $.type(wquery[clause]) === "number" || $.type(wquery[clause]) === "string") {
                    if (!_.isEmpty(wquery[clause]) && _.isArray(wquery[clause])) {
                        str += "." + clause + "('" + _.compact(wquery[clause]) + "')";
                    } else if (_.isNumber(wquery[clause]) || _.isString(wquery[clause])) {
                        str += "." + clause + "('" + wquery[clause] + "')";
                    }
                }
            }

            $textareaQueryResult.val(eval("squel.select()" + str));
        }
    };

    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
                if ( !$.data( this, "plugin_" + pluginName ) ) {
                    $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
                }
        });
    };

})( jQuery, window, document );
