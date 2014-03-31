;(function ( $, window, document, undefined ) {

    var pluginName = "wquerybuilder",
        defaults = {
            data: {}
        };
    var wquery = {
        from: [],
        field: [],
        spares: [],
        distintic: {},
        join: {},
        left_join: {},
        right_join: {},
        group: "",
        order: "",
        limit: 0,
        where: {}
    };
    var $selectboxTables,
        $selectboxTableColumns,
        $textareaQueryResult,
        $selectboxOptionsTag,
        $inputTextTop,
        $selectboxOrderby,
        $optionOrderbyType,
        $optionGroupbyType,
        $buttonCreateSpare,
        $inputTextSpare,
        $optionAggregate,
        $selectSpareColumnContent;

    function Plugin(element, options) {

        if (_.isString(options)){
            this.methods[options](this, element, options);
            return;
        }

        this.element = element;
        this.DataTypes = {
            TABLE: { value: "table" },
            COLUMN: { value: "column" },
            LIMIT: { value: "limit" },
            ORDERBY: { value: "orderby" },
            UNKNOW: { value: "unknow" },
            GROUPBY: { value: "group" },
            SPARECOLUMN: { value: "field" }
        };

        this.AggregateFunctions = {
            DAY: { value: "DAY" },
            MONTH: { value: "MONTH" },
            YEAR: { value: "YEAR" },
            FORMAT: { value: "FORMAT" }
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
            $optionOrderbyType = $(this.element).find("[name='worderbytype']");
            $optionAggregate = $(this.element).find("[name='waggregate']");
            $optionGroupbyType = $(this.element).find("[name='wgroupby']");
            $textareaQueryResult = $(this.element).find("[name='wresult']");
            $selectSpareColumnContent = $(this.element).find("[name='wcolumncontent']");
            $selectboxOptionsTag = $(this.element).find("[name='worderby'],[name='wgroupby'],[name='wcolumncontent'],[name='wcolumnunion']");
            $inputTextTop = $(this.element).find("[name='wtop']");
            $buttonCreateSpare = $(this.element).find("[name='wcreatespare']");
            $inputTextSpare = $(this.element).find("[name='wsparename']");

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
                self._executeQuery(self.DataTypes.TABLE, val);
                self._renderColumnsOptions(data, val);
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
                self._executeQuery(self.DataTypes.COLUMN, val, unval);
                self._renderOptions(data, val);
            });

            $selectboxOrderby.on("change", function(){
                var val = $(this).val();
                self._executeQuery(self.DataTypes.ORDERBY, val);
            });

            $optionGroupbyType.on("change", function () {
                var val = $(this).val();
                self._executeQuery(self.DataTypes.GROUPBY, val);
            });

            $optionOrderbyType.on("change", function(){
                if ($selectboxOrderby.val() === "" || $selectboxOrderby.val() === null)
                {
                    return;
                }
                var val = $selectboxOrderby.val();
                self._executeQuery(self.DataTypes.ORDERBY, val);
            });

            $inputTextTop.on("blur", function (){
                var val = parseInt($(this).val(), 10) || 0;
                self._executeQuery(self.DataTypes.LIMIT, val);
            });

            $buttonCreateSpare.on("click", function () {
                if (_.isEmpty($selectSpareColumnContent.val()) || _.isEmpty($inputTextSpare.val())) {
                    return;
                }
                var val = {
                    name: _.isEmpty($inputTextSpare.val()) ? $selectSpareColumnContent.val() : $inputTextSpare.val(),
                    aggregate: $optionAggregate.val(),
                    content: $selectSpareColumnContent.val()
                };
                self._executeQuery(self.DataTypes.SPARECOLUMN, val);
                self._cleanSpare();
            });
        },
        _renderColumnsOptions: function(data,val){
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
        _renderOptions: function (data, val) {
            if (val === null) {
                this._cleanOptions();
                return;
            }
            var options = "<option></option>";
            for (var i = 0; i < wquery.from.length; i++) {
                var table = wquery.from[i];
                var selected = "";
                for (var j = 0; j < data[table].length; j++){
                    var field = table + "." + data[table][j];
                    if ($selectboxOptionsTag.val() === field){
                        selected = "selected='selected'";
                    }
                    options += "<option value='" + field + "' " + selected + ">" + field + "</option>";
                }
            }
            $selectboxOptionsTag.html(options);
        },
        _cleanSpare: function(){
            $inputTextSpare.val("");
            $optionAggregate.find("option[selected]").removeAttr("selected");
            $optionAggregate.find("option:eq(0)").attr("selected", "selected");
            $selectSpareColumnContent.find("option[selected]").removeAttr("selected");
            $selectSpareColumnContent.find("option:eq(0)").attr("selected", "selected");
        },
        _cleanOptions: function(){
            $selectboxOptionsTag.html("");
        },
        _executeQuery: function (type, val, unval) {
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
                    if (val === ""){
                        wquery.order = null;
                        break;
                    }
                    wquery.order = val + "," + $optionOrderbyType.filter(function(){
                        return $(this).is(":checked");
                    }).val();
                    break;

                case this.DataTypes.GROUPBY:
                    wquery.group = val;
                    break;

                case this.DataTypes.SPARECOLUMN:
                    var flatVal = val.content;
                    if (!_.isEmpty(val.aggregate)){
                        flatVal = val.aggregate.toUpperCase() + "(" + val.content + ")";
                    }
                    str += ".field('" + flatVal + "','" + val.name + "')";
                    wquery.field.push(val.content);
                    break;

                default:
                    wquery.from.push(val);
                    break;
            }

            for (var clause in wquery) {
                if ($.isArray(wquery[clause]) || $.type(wquery[clause]) === "number" || $.type(wquery[clause]) === "string") {
                    if (!_.isEmpty(wquery[clause]) && _.isArray(wquery[clause])) {
                        for (var i = 0; i < wquery[clause].length; i++){
                            var v = _.isBoolean(wquery[clause][i]) ? wquery[clause][i] : "'" + wquery[clause][i] + "'";
                            str += "." + clause + "(" + v + ")";
                        }
                    } else if (_.isString(wquery[clause])) {
                        var splited = wquery[clause].split(",");
                        var l = splited.length;
                        if (l > 1) {
                            var z = "";
                            for (var j = 0; j < l; j++) {
                                if (splited[j].toLowerCase() === "true" || splited[j].toLowerCase() === "false") {
                                    z += splited[j];
                                }
                                else if (splited[j] !== null && splited[j] !== undefined) {
                                    z += "'" + splited[j] + "'";
                                }
                                else{
                                    continue;
                                }
                                if ((j + 1) !== l){
                                    z += ",";
                                }
                            }
                            str += "." + clause + "(" + z + ")";
                        }
                        else if (!_.isEmpty(wquery[clause])) {
                            str += "." + clause + "('" + wquery[clause] + "')";
                        }
                    } else if (_.isNumber(wquery[clause])) {
                        str += "." + clause + "('" + wquery[clause] + "')";
                    }
                }
            }

            $textareaQueryResult.val(eval("squel.select()" + str));
        },
        methods: {
            clean: function (self, element) {
                $selectboxTableColumns.html("");

                $(element).find(":input")
                 .not(":button, :submit, :reset, :hidden, [type='radio']")
                 .val("")
                 .removeAttr("selected");

                $(element).find("#wasc").attr("checked", "checked");
                $(element).find("#wdesc").removeAttr("checked");

                wquery = {};
                wquery = {
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
            }
        }
    };

    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) && !_.isString(options)) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            } else if ($.data( this, "plugin_" + pluginName ) && _.isString(options)){
                new Plugin(this, options);
            }
        });
    };

})( jQuery, window, document );
