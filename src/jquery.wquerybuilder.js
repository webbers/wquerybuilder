; (function ($, window, document, undefined) {

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
        $optionTopType,
        $selectboxOrderby,
        $optionOrderbyType,
        $optionGroupbyType,
        $buttonCreateSpare,
        $buttonClearAll,
        $inputTextSpare,
        $optionAggregate,
        $selectSpareColumnContent,
        $selectboxSpares,
        $buttonDeleteSpare,
        $buttonDeleteAllSpare;

    function Plugin(element, options) {

        if (_.isString(options)) {
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
            FORMAT: { value: "FORMAT" },
            COUNT: { value: "COUNT" },
            SUM: { value: "SUM" },
            AVERAGE: { value: "AVERAGE" }
        };

        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            //Tables
            $selectboxTables = $(this.element).find("[name='wtables']");
            //Columns
            $selectboxTableColumns = $(this.element).find("[name='wcolumns']");
            //Display
            $inputTextTop = $(this.element).find("[name='wtop']");
            $optionTopType = $(this.element).find("[name='wtoptype']");
            //Order by
            $selectboxOrderby = $(this.element).find("[name='worderby']");
            $optionOrderbyType = $(this.element).find("[name='worderbytype']");
            //Group by
            $optionGroupbyType = $(this.element).find("[name='wgroupby']");
            //Spare
            $inputTextSpare = $(this.element).find("[name='wsparename']");
            $optionAggregate = $(this.element).find("[name='waggregate']");
            $selectSpareColumnContent = $(this.element).find("[name='wcolumncontent']");
            $buttonCreateSpare = $(this.element).find("[name='wcreatespare']");
            $selectboxSpares = $(this.element).find("[name='wspares']");
            $buttonDeleteSpare = $(this.element).find("[name='wdeletespare']");
            $buttonDeleteAllSpare = $(this.element).find("[name='wdeleteallspare']");
            //Selectbox options [Ex: Table.Column]
            $selectboxOptionsTag = $(this.element).find("[name='worderby'],[name='wgroupby'],[name='wcolumncontent'],[name='wcolumnunion']");
            //Result
            $buttonClearAll = $(this.element).find("[name='wclearall']");
            $textareaQueryResult = $(this.element).find("[name='wresult']");


            if (this.options.data) {
                try {
                    this.initTables(this.options.data);
                    this.initListeners(this.options.data);
                    //this.methods.clean();
                } catch (a) {
                    alert("Error on initialize plugin");
                }
            }
        },
        initTables: function (data) {
            var options = "";
            for (var key in data) {
                options += "<option value='" + key + "'>" + key + "</option>";
            }
            $selectboxTables.html(options);
        },
        initListeners: function (data) {
            var self = this;
            $selectboxTables.on("change", function () {
                var val = $(this).val();
                self._executeQuery(self.DataTypes.TABLE, val);
                self._renderColumnsOptions(data, val);
                self._renderOptions(data, val);
            });

            $selectboxTableColumns.on("change", function () {
                var val = $(this).val();
                var unval = [];
                $.each($(this).find("option"), function () {
                    if (!$(this).prop("selected")) {
                        unval.push($(this).val());
                    }
                });
                self._executeQuery(self.DataTypes.COLUMN, val, unval);
                self._renderOptions(data, val);
            });

            $selectboxOrderby.on("change", function () {
                var val = $(this).val();
                self._executeQuery(self.DataTypes.ORDERBY, val);
            });

            $optionGroupbyType.on("change", function () {
                var val = $(this).val();
                self._executeQuery(self.DataTypes.GROUPBY, val);
            });

            $optionOrderbyType.on("change", function () {
                if ($selectboxOrderby.val() === "" || $selectboxOrderby.val() === null) {
                    return;
                }
                var val = $selectboxOrderby.val();
                self._executeQuery(self.DataTypes.ORDERBY, val);
            });

            $inputTextTop.on("blur", function () {
                var val = parseInt($(this).val(), 10) || 0;
                self._executeQuery(self.DataTypes.LIMIT, val);
            });

            $buttonCreateSpare.on("click", function () {
                if (_.isEmpty($selectSpareColumnContent.val()) || _.isEmpty($inputTextSpare.val())) {
                    return;
                }
                var val = {
                    name: $inputTextSpare.val(),
                    content: $selectSpareColumnContent.val(),
                    aggregate: $optionAggregate.val(),
                    format: $optionAggregate.find("option:selected").attr("data-format")
                };
                self._executeQuery(self.DataTypes.SPARECOLUMN, val);
                self._renderOptionsSpares();
                self._cleanSpare();
            });

            $buttonDeleteSpare.on("click", function () {
                var val = [];
                $.each($selectboxSpares.find("option"), function () {
                    if ($(this).prop("selected")) {
                        val.push($(this).val());
                        $(this).remove();
                    }
                });
                for (var j = 0; j < val.length; j++) {
                    for (var k = 0; k < wquery.spares.length; k++) {
                        var value = wquery.spares[k].content + "-" + wquery.spares[k].name;
                        if (val[j] === value) {
                            wquery.spares.splice(wquery.spares.indexOf(wquery.spares[k]), 1);
                        }
                    }
                }
                self._executeQuery(self.DataTypes.SPARECOLUMN, "");
            });

            $buttonDeleteAllSpare.on("click", function () {
                $selectboxSpares.html("");
                wquery.spares = [];
                self._executeQuery(self.DataTypes.SPARECOLUMN, "");
            });

            $buttonClearAll.on("click", function () {
                self._methods.clean();
            });
        },
        _renderColumnsOptions: function (data, val) {
            var options = "";
            for (var key in data[val]) {
                var selected = "";
                for (var i = 0; i < wquery.field.length; i++) {
                    if (wquery.field[i].indexOf(val + "." + data[val][key]) > -1) {
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
                for (var j = 0; j < data[table].length; j++) {
                    var field = table + "." + data[table][j];
                    if ($selectboxOptionsTag.val() === field) {
                        selected = "selected='selected'";
                    }
                    options += "<option value='" + field + "' " + selected + ">" + field + "</option>";
                }
            }
            $selectboxOptionsTag.html(options);
        },
        _renderOptionsSpares: function () {
            var options = "";
            for (var j = 0; j < wquery.spares.length; j++) {
                options += "<option value='" + wquery.spares[j].content + "-" + wquery.spares[j].name + "'>" + wquery.spares[j].content + " ( " + wquery.spares[j].name + " )</option>";
            }
            $selectboxSpares.html(options);
        },
        _cleanSpare: function () {
            $inputTextSpare.val("");
            $optionAggregate.find("option:selected").removeAttr("selected");
            $optionAggregate.find("option:eq(0)").attr("selected", "selected");
            $selectSpareColumnContent.find("option:selected").removeAttr("selected");
            $selectSpareColumnContent.find("option:eq(0)").attr("selected", "selected");
        },
        _cleanOptions: function () {
            $selectboxOptionsTag.html("");
        },
        _executeQuery: function (type, val, unval) {
            var str = "";
            switch (type) {
                case this.DataTypes.TABLE:
                    if (wquery.from.length <= 1 && wquery.field.length === 0) {
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
                        if (wquery.from.length === 0) {
                            wquery.from.push($selectboxTables.val());
                            wquery.field = [];
                            break;
                        }
                    }

                    if (_.findWhere(wquery.from, $selectboxTables.val()) === undefined && val !== null) {
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
                    if (val === "") {
                        wquery.order = null;
                        break;
                    }
                    wquery.order = val + "," + $optionOrderbyType.filter(function () {
                        return $(this).is(":checked");
                    }).val();
                    break;

                case this.DataTypes.GROUPBY:
                    wquery.group = val;
                    break;

                case this.DataTypes.SPARECOLUMN:
                    if (!_.isEmpty(val)) {
                        wquery.spares = _.union(wquery.spares, val);
                    }
                    break;

                default:
                    wquery.from.push(val);
                    break;
            }

            var froms = wquery.from;
            for (var from in froms) {
                if (!_.isEmpty(froms[from])) {
                    str += ".from('" + froms[from] + "')";
                }
            }

            var fields = wquery.field;
            for (var field in fields) {
                if (!_.isEmpty(fields[field])) {
                    str += ".field('" + fields[field] + "')";
                }
            }

            var spares = wquery.spares;
            for (var i = 0; i < spares.length; i++) {
                if (_.isEmpty(spares[i].aggregate)) {
                    str += ".field('" + spares[i].content + "', '" + spares[i].name + "')";
                } else {
                    if (!_.isEmpty(spares[i].format)) {
                        str += ".field(\"" + spares[i].aggregate + "(" + spares[i].content + ", '" + spares[i].format + "')\", '" + spares[i].name + "')";
                    } else {
                        str += ".field('" + spares[i].aggregate + "(" + spares[i].content + ")', '" + spares[i].name + "')";
                    }
                }
            }

            var order = wquery.order;
            if (!_.isEmpty(order)) {
                str += ".order('" + order.split(",")[0] + "'," + order.split(",")[1] + ")";
            }

            var group = wquery.group;
            if (!_.isEmpty(group)) {
                str += ".group('" + group + "')";
            }

            $textareaQueryResult.val(eval("squel.select()" + str));
        },
        methods: {
            clean: function (self, element) {
                $selectboxTableColumns.html("");

                $(element).find("input, textarea, select")
                 .not("[type='button'], [type='submit'], [type='reset'], [type='hidden'], [type='radio']")
                 .val("")
                 .removeAttr("selected");

                $(element).find("#wasc").attr("checked", "checked");
                $(element).find("#wdesc").removeAttr("checked");

                wquery = {};
                wquery = {
                    from: [],
                    field: [],
                    spares: [],
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

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName) && !_.isString(options)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            } else if ($.data(this, "plugin_" + pluginName) && _.isString(options)) {
                new Plugin(this, options);
            }
        });
    };

})(jQuery, window, document);
