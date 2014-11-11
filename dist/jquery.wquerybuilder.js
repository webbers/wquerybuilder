/*
 *  jQuery WQueryBuilder - v0.1.0
 *  jQuery Plugin to create sql queries an easy way
 *  
 *
 *  Made by Webbers
 *  Under MIT License
 */
function difference(a1, a2) {
    var d1 = $(a1).not(a2).get();
    return d1;
}
function uniq(a1){
    return a1.filter(function(item, pos) {
        return a1.indexOf(item) === pos;
    });
}
function compact(a1){
    return $.grep(a1, function(n){
        return (n !== "" && n !== null);
    });
}
function union(a1, a2){
    var arr = a1.concat(a2);
    return arr.filter(function (item, pos) {return arr.indexOf(item) === pos;});
}
function findWhere(a1, match){
    var index = a1.indexOf(match);
    if(index > -1){
        return a1[index];
    }
    return undefined;
}
(function ($, window, document, undefined) {

    var pluginName = "wquerybuilder",
        defaults = {
            data: {},
            sqlType: "MYSQL"
        };
    var wquery = {
        from: [],
        field: [],
        spare: [],
        union: [],
        where: [],
        group: "",
        order: "",
        limit: ""
    };
    var sqlType = "";
    var $selectboxTables,
        $selectboxTableColumns,
        $textareaQueryResult,
        $selectboxOptionsTag,
        $inputTextTop,
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
        $buttonDeleteAllSpare,
        $optionUnionFirst,
        $optionUnionSecond,
        $buttonCreateUnion,
        $buttonDeleteAllUnion,
        $optionFilter,
        $optionOperator,
        $inputValueFilter,
        $buttonCreateFilter,
        $buttonDeleteAllFilter,
        $buttonSetTop,
        $buttonClearTop;

    function Plugin(element, options) {

        if (typeof options === "string") {
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
            SPARECOLUMN: { value: "field" },
            UNION: { value: "union" },
            WHERE: { value: "where" }
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
            $buttonSetTop = $(this.element).find("[name='wsettop']");
            $buttonClearTop = $(this.element).find("[name='wcleartop']");
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
            //Union
            $optionUnionFirst = $(this.element).find("[name='wfirstcolumnunion']");
            $optionUnionSecond = $(this.element).find("[name='wsecondcolumnunion']");
            $buttonCreateUnion = $(this.element).find("[name='wcreateunion']");
            $buttonDeleteAllUnion = $(this.element).find("[name='wdeleteallunion']");
            //Where
            $optionFilter = $(this.element).find("[name='wcolumnfilter']");
            $optionOperator = $(this.element).find("[name='woperator']");
            $inputValueFilter = $(this.element).find("[name='wvaluefilter']");
            $buttonCreateFilter = $(this.element).find("[name='wcreatefilter']");
            $buttonDeleteAllFilter = $(this.element).find("[name='wdeletefilter']");
            //Selectbox options [Ex: Table.Column]
            $selectboxOptionsTag = $(this.element).find("[name='worderby'],[name='wgroupby'],[name='wcolumncontent'],[name='wfirstcolumnunion'],[name='wcolumnfilter']");
            //Result
            $buttonClearAll = $(this.element).find("[name='wclearall']");
            $textareaQueryResult = $(this.element).find("[name='wresult']");


            if (this.options.data) {
                try {
                    sqlType = this.options.sqlType;
                    this.initTables(this.options.data);
                    this.initListeners(this.options.data, this.element);
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
        initListeners: function (data, element) {
            var self = this;
            $selectboxTables.on("change", function () {
                var val = $(this).val();
                self._executeQuery(self.DataTypes.TABLE, val);
                self._renderColumnsOptions(data, val);
                self._renderOptions(data, val);
                self._renderSecondUnionOptions(data);
                self._renderFirstUnionOptions(data, val);
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

            $buttonSetTop.on("click", function () {
                var val = parseInt($inputTextTop.val(), 10) || 0;
                self._executeQuery(self.DataTypes.LIMIT, val);
            });

            $inputTextTop.on("blur", function () {
                var val = parseInt($(this).val(), 10) || 0;
                self._executeQuery(self.DataTypes.LIMIT, val);
            });

            $buttonClearTop.on("click", function () {
                $inputTextTop.html("1000");
                wquery.limit = [];
                self._executeQuery(self.DataTypes.LIMIT, "");
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

            $buttonCreateSpare.on("click", function () {
                if ($.isEmptyObject($selectSpareColumnContent.val()) || $.isEmptyObject($inputTextSpare.val())) {
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
                    for (var k = 0; k < wquery.spare.length; k++) {
                        var value = wquery.spare[k].content + "-" + wquery.spare[k].name;
                        if (val[j] === value) {
                            wquery.spare.splice(wquery.spare.indexOf(wquery.spare[k]), 1);
                        }
                    }
                }
                self._executeQuery(self.DataTypes.SPARECOLUMN, "");
            });

            $buttonDeleteAllSpare.on("click", function () {
                $selectboxSpares.html("");
                wquery.spare = [];
                self._executeQuery(self.DataTypes.SPARECOLUMN, "");
            });

            $buttonCreateUnion.on("click", function () {
                if ($.isEmptyObject($optionUnionFirst.val()) || $.isEmptyObject($optionUnionSecond.val())) {
                    return;
                }
                var val = {
                    firstTable: ($optionUnionFirst.val().split("."))[0],
                    secondTable: ($optionUnionSecond.val().split("."))[0],
                    firstColumn: $optionUnionFirst.val(),
                    secondColumn: $optionUnionSecond.val()
                };
                var unionFirst = [];
                var unionSecond = [];
                for (var i = 0; i < wquery.union.length; i++) {
                    unionFirst.push(wquery.union[i].firstTable);
                    unionSecond.push(wquery.union[i].secondTable);
                }
                if ((unionFirst.indexOf(val.secondTable) > -1) || (unionSecond.indexOf(val.secondTable) > -1)) {
                    var auxTable = val.firstTable;
                    var auxColumn = val.firstColumn;
                    val.firstTable = val.secondTable;
                    val.firstColumn = val.secondColumn;
                    val.secondTable = auxTable;
                    val.secondColumn = auxColumn;
                }
                unionFirst.push(val.firstTable);
                unionSecond.push(val.secondTable);
                unionFirst = uniq(unionFirst);
                unionSecond = uniq(unionSecond);
                wquery.from = difference(wquery.from, unionFirst);
                wquery.from = difference(wquery.from, unionSecond);
                self._executeQuery(self.DataTypes.UNION, val);
                $optionUnionFirst.val("");
                $optionUnionSecond.val("");
            });

            $buttonDeleteAllUnion.on("click", function () {
                if (wquery.field.length > 0) {
                    for (var field in wquery.field) {
                        wquery.from.push(((wquery.field[field]).split("."))[0]);
                    }
                } else {
                    wquery.from.push($selectboxTables.val());
                }
                $.grep(wquery.from, function(n){
                    return !n;
                });
                wquery.union = [];
                self._executeQuery(self.DataTypes.UNION, "");
            });

            $buttonCreateFilter.on("click", function () {
                if ($.isEmptyObject($optionFilter.val()) || $.isEmptyObject($optionOperator.val()) || $inputValueFilter.val() === "") {
                    return;
                }
                var val = {
                    column: $optionFilter.val(),
                    operator: $optionOperator.val(),
                    value: $inputValueFilter.val()
                };
                self._executeQuery(self.DataTypes.WHERE, val);
                $optionFilter.val("");
                $optionOperator.find("option:eq(0)").attr("selected", "selected");
                $inputValueFilter.val("");
            });

            $buttonDeleteAllFilter.on("click", function () {
                wquery.where = [];
                self._executeQuery(self.DataTypes.WHERE, "");
            });

            $buttonClearAll.on("click", function () {
                self.methods.clean(element);
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
            for (var j = 0; j < wquery.spare.length; j++) {
                options += "<option value='" + wquery.spare[j].content + "-" + wquery.spare[j].name + "'>" + wquery.spare[j].content + " ( " + wquery.spare[j].name + " )</option>";
            }
            $selectboxSpares.html(options);
        },
        _renderFirstUnionOptions: function (data, val) {
            var options = "<option></option>";
            for (var key in data[val]) {
                var cval = val + "." + data[val][key];
                options += "<option value='" + cval + "'>" + cval + "</option>";
            }
            $optionUnionFirst.html(options);
        },
        _renderSecondUnionOptions: function (data) {
            var options = "<option></option>";
            for (var val in data) {
                for (var key in data[val]) {
                    var cval = val + "." + data[val][key];
                    options += "<option value='" + cval + "'>" + cval + "</option>";
                }
            }
            $optionUnionSecond.html(options);
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
                    if (wquery.from.length <= 1 && wquery.field.length === 0 && wquery.union.length === 0) {
                        wquery.from = [];
                        wquery.from.push(val);
                    }
                    break;

                case this.DataTypes.COLUMN:
                    var tablesUnion = [];
                    for (var l = 0; l < wquery.union.length; l++) {
                        tablesUnion.push(wquery.union[l].firstTable);
                        tablesUnion.push(wquery.union[l].secondTable);
                    }
                    tablesUnion = uniq(tablesUnion);

                    if (val === null && wquery.from.length === 0) {
                        wquery.from = [];
                        wquery.from.push($selectboxTables.val());
                        if (tablesUnion.length !== 0) {
                            wquery.from = difference(wquery.from, tablesUnion);
                            wquery.field = difference(wquery.field, unval);
                        } else {
                            wquery.field = [];
                        }
                        break;
                    }
                    if (val === null) {
                        wquery.from = difference(wquery.from, [$selectboxTables.val()]);
                        if (wquery.from.length === 0) {
                            wquery.from.push($selectboxTables.val());
                            wquery.field = [];
                            if (tablesUnion.length !== 0) {
                                wquery.from = difference(wquery.from, tablesUnion);
                            }
                            break;
                        }
                    }

                    if (findWhere(wquery.from, $selectboxTables.val()) === undefined && val !== null) {
                        if ((tablesUnion.length === 0) || (tablesUnion.length !== 0 && tablesUnion.indexOf($selectboxTables.val()) > -1)) {
                            wquery.from.push($selectboxTables.val());
                            wquery.from = uniq(wquery.from);
                        }
                    }

                    if ((tablesUnion.length === 0) || (tablesUnion.length !== 0 && tablesUnion.indexOf($selectboxTables.val()) > -1)) {
                        wquery.field = union(wquery.field, val);
                        wquery.field = difference(wquery.field, unval);
                        wquery.field = compact(wquery.field);
                    }

                    wquery.from = difference(wquery.from, tablesUnion);
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
                    if (!$.isEmptyObject(val)) {
                        wquery.spare = union(wquery.spare, val);
                    }
                    break;

                case this.DataTypes.UNION:
                    if (!$.isEmptyObject(val)) {
                        wquery.union = union(wquery.union, val);
                    }
                    break;

                case this.DataTypes.WHERE:
                    if (!$.isEmptyObject(val)) {
                        wquery.where = union(wquery.where, val);
                    }
                    break;

                default:
                    wquery.from.push(val);
                    break;
            }

            var froms = wquery.from;
            for (var from in froms) {
                if (!$.isEmptyObject(froms[from])) {
                    str += ".from('" + froms[from] + "')";
                }
            }

            var fields = wquery.field;
            for (var field in fields) {
                if (!$.isEmptyObject(fields[field])) {
                    str += ".field('" + fields[field] + "')";
                }
            }

            var spares = wquery.spare;
            for (var i = 0; i < spares.length; i++) {
                if ($.isEmptyObject(spares[i].aggregate)) {
                    str += ".field('" + spares[i].content + "', '" + spares[i].name + "')";
                } else {
                    if (!$.isEmptyObject(spares[i].format)) {
                        str += ".field(\"" + spares[i].aggregate + "(" + spares[i].content + ", '" + spares[i].format + "')\", '" + spares[i].name + "')";
                    } else {
                        str += ".field('" + spares[i].aggregate + "(" + spares[i].content + ")', '" + spares[i].name + "')";
                    }
                }
            }

            var order = wquery.order;
            if (!$.isEmptyObject(order)) {
                str += ".order('" + order.split(",")[0] + "'," + order.split(",")[1] + ")";
            }

            var group = wquery.group;
            if (!$.isEmptyObject(group)) {
                str += ".group('" + group + "')";
            }

            var unions = wquery.union;
            for (var j = 0; j < unions.length; j++) {
                if (j === 0) {
                    str += ".from('" + unions[j].firstTable + "')";
                }
                str += ".join('" + unions[j].secondTable + "', null, '" + unions[j].firstColumn + " = " + unions[j].secondColumn + "')";
            }

            var filters = wquery.where;
            for (var k = 0; k < filters.length; k++) {
                var value = parseInt(filters[k].value, 10) || "\"" + filters[k].value + "\"";
                str += ".where('" + filters[k].column + " " + filters[k].operator + " " + value + "')";
            }

            var result = "";
            if (wquery.limit === "") {
                result = eval("squel.select()" + str);
            } else {
                if (sqlType === "MSSQL") {
                    var top = "SELECT TOP " + wquery.limit;
                    result = eval("squel.select()" + str).toString();
                    result = result.replace("SELECT", top);
                } else if (sqlType === "ORACLE") {
                    str += ".where('ROWNUM <= " + wquery.limit + "')";
                    result = eval("squel.select()" + str);
                } else if (sqlType === "MYSQL") {
                    str += ".limit(" + wquery.limit + ")";
                    result = eval("squel.select()" + str);
                }
            }

            $textareaQueryResult.val(result);
        },
        methods: {
            clean: function (element) {
                $selectboxTableColumns.html("");
                $selectboxSpares.html("");
                $selectboxOptionsTag.html("");
                $optionUnionSecond.html("");

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
                    spare: [],
                    union: [],
                    where: [],
                    group: "",
                    order: "",
                    limit: ""
                };
            },
            mysql: function() {
                sqlType = "MYSQL";
            },
            mssql: function () {
                sqlType = "MSSQL";
            },
            oracle: function () {
                sqlType = "ORACLE";
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName) && (typeof options !== "string")) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            } else if ($.data(this, "plugin_" + pluginName) && typeof options === "string") {
                new Plugin(this, options);
            }
        });
    };

})(jQuery, window, document);
