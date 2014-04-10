var $tables, $columns, $queryResult, $usersTable, $productsTable, $storageTable, $orderby, $orderbyOptions, $spareName, $spareColumn, $aggregate, $spares, $createSpare, $deleteSpare, $deleteAllSpare,
    $firstColumnUnion, $secondColumnUnion, $createUnion, $deleteAllUnion, $columnFilter, $operatorType, $valueFilter, $createFilter, $deleteAllFilter, $topValue, $setTop;
QUnit.begin(function(){
    $tables = $('[name="wtables"]');
    $columns = $("[name='wcolumns']");
    $queryResult = $('[name="wresult"]');
    $usersTable = $('[name="wtables"] option:eq(0)');
    $productsTable = $('[name="wtables"] option:eq(1)');
    $storageTable = $('[name="wtables"] option:eq(2)');
    $orderby = $("[name='worderby']");
    $spareName = $("[name='wsparename']");
    $spareColumn = $("[name='wcolumncontent']");
    $aggregate = $("[name='waggregate']");
    $spares = $("[name='wspares']");
    $createSpare = $("[name='wcreatespare']");
    $deleteSpare = $("[name='wdeletespare']");
    $deleteAllSpare = $("[name='wdeleteallspare']");
    $firstColumnUnion = $("[name='wfirstcolumnunion']");
    $secondColumnUnion = $("[name='wsecondcolumnunion']");
    $createUnion = $("[name='wcreateunion']");
    $deleteAllUnion = $("[name='wdeleteallunion']");
    $columnFilter = $("[name='wcolumnfilter']");
    $operatorType = $("[name='woperator']");
    $valueFilter = $("[name='wvaluefilter']");
    $createFilter = $("[name='wcreatefilter']");
    $deleteAllFilter = $("[name='wdeletefilter']");
    $topValue = $("[name='wtop']");
    $setTop = $("[name='wsettop']");
    $clearTop = $("[name='wcleartop']");
});

QUnit.testDone(function( details ) {
    $('#querybuilder').wquerybuilder("clean");
});

module("Tables and Columns tests");

test("Should show the correct query after select a table",function(){
    $usersTable.attr('selected','selected').trigger('change');
    var selectValue = $tables.val();
    var result = "SELECT * FROM " + selectValue;
    equal($queryResult.val(), result);
    
    $productsTable.attr('selected','selected').trigger('change');
    selectValue = $tables.val();
    result = "SELECT * FROM " + selectValue;
    equal($queryResult.val(), result);
    
    $storageTable.attr('selected','selected').trigger('change');;
    selectValue = $tables.val();
    var result = "SELECT * FROM " + selectValue;
    equal($queryResult.val(), result);
});

test("Should show the correct query after select and unselect columns",function(){
    $usersTable.attr('selected','selected').trigger('change');
    
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(1)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(2)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(3)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(4)').attr('selected','selected').trigger('change');
    
    var table = $tables.val();
    var columns = $columns.val();
    var result = "SELECT " + columns.toString().replace(/,/g, ', ') + " FROM " + table
    equal($queryResult.val(), result);
    
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(1)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(2)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(3)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(4)').removeAttr('selected').trigger('change');
    
    result = "SELECT * FROM " + table;
    equal($queryResult.val(), result);
});

test("Should show the correct query after select and unselect multiple tables and columns",function(){
    var columns = "";
    var table = "";
    $usersTable.attr('selected','selected').trigger('change');
    
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(1)').attr('selected','selected').trigger('change');
    columns += $columns.val();
    table += $tables.val();
    
    $productsTable.attr('selected','selected').trigger('change');
    
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(1)').attr('selected','selected').trigger('change');
    columns += "," + $columns.val();
    table += $tables.val();
    
    $storageTable.attr('selected','selected').trigger('change');
    
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $columns.find('option:eq(1)').attr('selected','selected').trigger('change');
    columns += "," + $columns.val();
    table += $tables.val();
    
    var result = "SELECT " + columns.toString().replace(/,/g, ', ') + " FROM " + $usersTable.text() + ", " + $productsTable.text() + ", " + $storageTable.text();
    equal($queryResult.val(), result);
});

test("Should show the correct query after select and unselect only first column of two tables", function(){
    var table = "";
    var columns = "";
    
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    var firstColumnText = $columns.find('option:eq(0)').text();
    table += $tables.val();
    columns += $columns.val();
    
    $productsTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    table += ", " + $tables.val();
    columns += ", " +$columns.val();
    
    
    var result = "SELECT " + columns + " FROM " + table;
    equal($queryResult.val(), result);
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    
    result = "SELECT " + $usersTable.text() + "." + firstColumnText + " FROM " + $usersTable.text();
    equal($queryResult.val(), result);
});


module("Orderby tests");

test("Should populate orderby selectbox after select a column",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $orderbyOptions = $('[name="worderby"] option');
    for(var i = 1; i < $orderbyOptions.length; i++){
        $($orderbyOptions[i]).val();
        ok($($orderbyOptions[i]).val().indexOf($usersTable.text()) > -1);
    }
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    
    $productsTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $orderbyOptions = $('[name="worderby"] option');
    for(var i = 1; i < $orderbyOptions.length; i++){
        $($orderbyOptions[i]).val();
        ok($($orderbyOptions[i]).val().indexOf($productsTable.text()) > -1);
    }
});

test("Should populate orderby selectbox after select a column of two types of tables",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');

    $productsTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $orderbyOptions = $('[name="worderby"] option');
    
    for(var i = 1; i < $orderbyOptions.length; i++){
        $($orderbyOptions[i]).val();
        ok($($orderbyOptions[i]).val().indexOf($productsTable.text()) > -1 || $($orderbyOptions[i]).val().indexOf($usersTable.text()) > -1);
    }
});

test("Should show the correct query after select to order by ASC or DESC ",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    $orderby.find('option:eq(1)').attr('selected','selected').trigger('change');
    
    var result = "SELECT Users.Id FROM Users ORDER BY Users.Id ASC";
    equal($queryResult.val(), result);
    
    $('#wasc').removeAttr('checked');
    $('#wdesc').attr('checked','checked').trigger('change');
    
    result = "SELECT Users.Id FROM Users ORDER BY Users.Id DESC";
    equal($queryResult.val(), result);
    
    $orderby.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    result = "SELECT Users.Id FROM Users"; 
    equal($queryResult.val(), result);
});

module("Groupby tests");

test("Should populate groupby selectbox after select a column",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    var $groupbyOptions = $('[name="wgroupby"] option');
    for(var i = 1; i < $groupbyOptions.length; i++){
        $($groupbyOptions[i]).val();
        ok($($groupbyOptions[i]).val().indexOf($usersTable.text()) > -1);
    }
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    
    $productsTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    $groupbyOptions = $('[name="wgroupby"] option');
    for(var i = 1; i < $groupbyOptions.length; i++){
        $($groupbyOptions[i]).val();
        ok($($groupbyOptions[i]).val().indexOf($productsTable.text()) > -1);
    }
});

test("Should populate groupby selectbox after select a column of two types of tables",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');

    $productsTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    var $groupbyOptions = $('[name="wgroupby"] option');
    
    for(var i = 1; i < $groupbyOptions.length; i++){
        $($groupbyOptions[i]).val();
        ok($($groupbyOptions[i]).val().indexOf($productsTable.text()) > -1 || $($groupbyOptions[i]).val().indexOf($usersTable.text()) > -1);
    }
});

test("Should show the correct query after select to group by",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    $orderby.find('option:eq(1)').attr('selected','selected').trigger('change');
    
    var result = "SELECT Users.Id FROM Users ORDER BY Users.Id ASC";
    equal($queryResult.val(), result);
    
    $orderby.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    result = "SELECT Users.Id FROM Users"; 
    equal($queryResult.val(), result);
});

module("Spare columns tests");

test("Should show the correct query after create a spare column without aggregate function", function() {
    $usersTable.attr('selected', 'selected').trigger('change');

$spareName.val('name_test');
    var name = $spareName.val();
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    var column = $spareColumn.val();

    $createSpare.trigger('click');

    var result = 'SELECT ' + column + ' AS ' + '"' + name + '" FROM ' + $usersTable.val();
    equal($queryResult.val(), result);
    equal($spares.find('option').val(), column + '-' + name);
});

test("Should show the correct query after create multiple spare columns without aggregate function", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    var result = 'SELECT ';
    var name = [];
    var column = [];

    $spareName.val('name_test_1');
    name[0] = $spareName.val();
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    column[0] = $spareColumn.val();
    $createSpare.trigger('click');
    result += column[0] + ' AS ' + '"' + name[0] + '", ';

    $spareName.val('name_test_2');
    name[1] = $spareName.val();
    $spareColumn.find('option:eq(2)').attr('selected', 'selected');
    column[1] = $spareColumn.val();
    $createSpare.trigger('click');
    result += column[1] + ' AS ' + '"' + name[1] + '", ';

    $spareName.val('name_test_3');
    name[2] = $spareName.val();
    $spareColumn.find('option:eq(3)').attr('selected', 'selected');
    column[2] = $spareColumn.val();
    $createSpare.trigger('click');
    result += column[2] + ' AS ' + '"' + name[2] + '"';

    result += ' FROM ' + $usersTable.val();

    equal($queryResult.val(), result);
    $spares.find('option').each(function(index) {
        equal($(this).val(), column[index] + '-' + name[index]);
    });
});

test("Should show the correct query after create a spare column with a simple aggregate function", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    $spareName.val('name_test');
    var name = $spareName.val();
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    var column = $spareColumn.val();
    $aggregate.find('option:eq(1)').attr('selected', 'selected');
    var agg = $aggregate.val();

    $createSpare.trigger('click');

    var result = 'SELECT ' + agg + '(' + column + ')' + ' AS ' + '"' + name + '" FROM ' + $usersTable.val();
    equal($queryResult.val(), result);
});

test("Should show the correct query after create a spare column with a format aggregate function", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    $spareName.val('name_test');
    var name = $spareName.val();
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    var column = $spareColumn.val();
    $aggregate.find('option:eq(4)').attr('selected', 'selected');
    var agg = $aggregate.val();
    var format = $aggregate.find(':selected').attr("data-format");

    $createSpare.trigger('click');

    var result = "SELECT " + agg + "(" + column + ", '" + format + "')" + " AS " + '"' + name + '" FROM ' + $usersTable.val();
    equal($queryResult.val(), result);
});

test("Should show the correct query after delete a spare column", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    $spareName.val('name_test');
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    $createSpare.trigger('click');

    $spares.find('option:eq(0)').attr('selected', 'selected');
    $deleteSpare.trigger('click');

    var result = 'SELECT * FROM ' + $usersTable.val();
    equal($queryResult.val(), result);
    ok($spares.find('option').length === 0);
});

test("Should show the correct query after delete multiple spare columns", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    var result = 'SELECT ';
    var name = [];
    var column = [];

    $spareName.val('name_test_1');
    name[0] = $spareName.val();
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    column[0] = $spareColumn.val();
    $createSpare.trigger('click');

    $spareName.val('name_test_2');
    name[1] = $spareName.val();
    $spareColumn.find('option:eq(2)').attr('selected', 'selected');
    column[1] = $spareColumn.val();
    $createSpare.trigger('click');

    $spareName.val('name_test_3');
    name[2] = $spareName.val();
    $spareColumn.find('option:eq(3)').attr('selected', 'selected');
    column[2] = $spareColumn.val();
    $createSpare.trigger('click');
    result += column[2] + ' AS ' + '"' + name[2] + '"';

    result += ' FROM ' + $usersTable.val();

    $spares.find('option:eq(0), option:eq(1)').attr('selected', 'selected');
    $deleteSpare.trigger('click');

    equal($queryResult.val(), result);
    ok(!$spares.find("option[value='" + column[0] + '-' + name[0] + "']").length > 0);
    ok(!$spares.find("option[value='" + column[1] + '-' + name[1] + "']").length > 0);
    ok($spares.find("option[value='" + column[2] + '-' + name[2] + "']").length > 0);
});

test("Should show the correct query after delete all spare columns", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    $spareName.val('name_test_1');
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');;
    $createSpare.trigger('click');

    $spareName.val('name_test_2');
    $spareColumn.find('option:eq(2)').attr('selected', 'selected');
    $createSpare.trigger('click');

    $spareName.val('name_test_3');
    $spareColumn.find('option:eq(3)').attr('selected', 'selected');
    $createSpare.trigger('click');

    $deleteAllSpare.trigger('click');

    var result = 'SELECT * FROM ' + $usersTable.val();
    equal($queryResult.val(), result);
    ok($spares.find('option').length === 0);
});

module("Union tests");

test("Should show the correct query after create a union table", function () {
    var firstTable = $storageTable.attr('selected', 'selected').trigger('change').val();
    var firstColumn = $firstColumnUnion.find('option:eq(1)').attr('selected', 'selected').val();
    var secondColumn = $secondColumnUnion.find('option:eq(9)').attr('selected', 'selected').val();
    var secondTable = secondColumn.split('.');

    $createUnion.trigger('click');

    var result = 'SELECT * FROM ' + firstTable + ' INNER JOIN ' + secondTable[0] + ' ON (' + firstColumn + ' = ' + secondColumn + ')';
    equal($queryResult.val(), result);
});

test("Should show the correct query after create a multiple union tables", function () {
    var firstColumn = [];
    var secondColumn = [];
    var secondTable = [];

    var firstTable = $storageTable.attr('selected', 'selected').trigger('change').val();

    firstColumn[0] = $firstColumnUnion.find('option:eq(1)').attr('selected', 'selected').val();
    secondColumn[0] = $secondColumnUnion.find('option:eq(9)').attr('selected', 'selected').val();
    secondTable[0] = secondColumn[0].split('.');

    $createUnion.trigger('click');

    firstColumn[1] = $firstColumnUnion.find('option:eq(2)').attr('selected', 'selected').val();
    secondColumn[1] = $secondColumnUnion.find('option:eq(1)').attr('selected', 'selected').val();
    secondTable[1] = secondColumn[1].split('.');

    $createUnion.trigger('click');

    var result = 'SELECT * FROM ' + firstTable + ' INNER JOIN ' + secondTable[0][0] + ' ON (' + firstColumn[0] + ' = ' + secondColumn[0] + ') INNER JOIN ' + secondTable[1][0] + ' ON (' + firstColumn[1] + ' = ' + secondColumn[1] + ')';
    equal($queryResult.val(), result);
});

test("Should show the correct query after delete all union tables", function () {
    var firstTable = $storageTable.attr('selected', 'selected').trigger('change').val();

    $firstColumnUnion.find('option:eq(1)').attr('selected', 'selected').val();
    $secondColumnUnion.find('option:eq(9)').attr('selected', 'selected').val();

    $createUnion.trigger('click');

    firstColumn = $firstColumnUnion.find('option:eq(2)').attr('selected', 'selected').val();
    secondColumn = $secondColumnUnion.find('option:eq(1)').attr('selected', 'selected').val();

    $createUnion.trigger('click');
    $deleteAllUnion.trigger('click');

    var result = 'SELECT * FROM ' + firstTable;
    equal($queryResult.val(), result);
});

module("Where tests");

test("Should show the correct query after create a where clause", function () {
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    var column = $columnFilter.find('option:eq(1)').attr('selected', 'selected').val();
    var operator = $operatorType.find('option:eq(1)').attr('selected', 'selected').val();
    var value = $valueFilter.val("2").val();

    $createFilter.trigger('click');

    var result = 'SELECT * FROM ' + table + ' WHERE (' + column + ' ' + operator + ' ' + value + ')';
    equal($queryResult.val(), result);
});

test("Should show the correct query after create a multiple where clauses", function () {
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    var column = [];
    var operator = [];
    var value = [];

    column[0] = $columnFilter.find('option:eq(1)').attr('selected', 'selected').val();
    operator[0] = $operatorType.find('option:eq(1)').attr('selected', 'selected').val();
    value[0] = $valueFilter.val("2").val();
    $createFilter.trigger('click');

    var result = 'SELECT * FROM ' + table + ' WHERE (' + column[0] + ' ' + operator[0] + ' ' + value[0] + ')';
    equal($queryResult.val(), result);

    column[1] = $columnFilter.find('option:eq(1)').attr('selected', 'selected').val();
    operator[1] = $operatorType.find('option:eq(1)').attr('selected', 'selected').val();
    value[1] = $valueFilter.val("test_string").val();
    $createFilter.trigger('click');

    result = 'SELECT * FROM ' + table + ' WHERE (' + column[0] + ' ' + operator[0] + ' ' + value[0] + ') AND (' + column[1] + ' ' + operator[1] + ' "' + value[1] + '")';
    equal($queryResult.val(), result);
});

test("Should show the correct query after delete all where clauses", function () {
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    $columnFilter.find('option:eq(1)').attr('selected', 'selected');
    $operatorType.find('option:eq(1)').attr('selected', 'selected');
    $valueFilter.val("2").val();

    $createFilter.trigger('click');
    $deleteAllFilter.trigger('click');

    var result = 'SELECT * FROM ' + table;
    equal($queryResult.val(), result);
});

module("Top tests");

test("Should show the correct query using 'top' of MYSQL", function () {
    $('#querybuilder').wquerybuilder("mysql");
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    var topValue = $topValue.val();

    $setTop.trigger('click');

    var result = 'SELECT * FROM ' + table + ' LIMIT ' + topValue;
    equal($queryResult.val(), result);

    $topValue.trigger('blur');
    equal($queryResult.val(), result);
});

test("Should show the correct query using 'top' of ORACLE", function () {
    $('#querybuilder').wquerybuilder("oracle");
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    var topValue = $topValue.val();

    $setTop.trigger('click');

    var result = 'SELECT * FROM ' + table + ' WHERE (ROWNUM <= ' + topValue + ')';
    equal($queryResult.val(), result);

    $topValue.trigger('blur');
    equal($queryResult.val(), result);
});

test("Should show the correct query using 'top' of MSSQL", function () {
    $('#querybuilder').wquerybuilder("mssql");
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    var topValue = $topValue.val();

    $setTop.trigger('click');

    var result = 'SELECT TOP ' + topValue + ' * FROM ' + table;
    equal($queryResult.val(), result);

    $topValue.trigger('blur');
    equal($queryResult.val(), result);
});

test("Should show the correct query without 'top'", function () {
    $('#querybuilder').wquerybuilder("mysql");
    var table = $usersTable.attr('selected', 'selected').trigger('change').val();
    $setTop.trigger('click');
    $clearTop.trigger('click');
    var result = 'SELECT * FROM ' + table;
    equal($queryResult.val(), result);

    $('#querybuilder').wquerybuilder("oracle");
    $setTop.trigger('click');
    $clearTop.trigger('click');
    equal($queryResult.val(), result);

    $('#querybuilder').wquerybuilder("mssql");
    $setTop.trigger('click');
    $clearTop.trigger('click');
    equal($queryResult.val(), result);
});