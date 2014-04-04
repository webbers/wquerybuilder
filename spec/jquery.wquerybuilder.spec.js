var $tables, $columns, $queryResult, $usersTable, $productsTable, $storageTable, $orderby, $orderbyOptions, $spareName, $spareColumn, $aggregate, $spares, $createSpare, $deleteSpare, $deleteAllSpare;
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
});

QUnit.testDone(function( details ) {
    $('#querybuilder').wquerybuilder("clean");
});

module( "Tables and Columns tests" );
test("Should show the correct query after select a table",function(){
    $usersTable.attr('selected','selected').trigger('change');
    var selectValue = $tables.val();
    var result = $queryResult.val();
    equal("SELECT * FROM " + selectValue,result);
    
    $productsTable.attr('selected','selected').trigger('change');
    selectValue = $tables.val();
    result = $queryResult.val();
    equal(result, "SELECT * FROM " + selectValue);
    
    $storageTable.attr('selected','selected').trigger('change');
    result = $queryResult.val();
    selectValue = $tables.val();
    equal(result, "SELECT * FROM " + selectValue);
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
    var result = $queryResult.val();
    equal(result, "SELECT " + columns.toString().replace(/,/g, ', ') + " FROM " + table);
    
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(1)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(2)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(3)').removeAttr('selected').trigger('change');
    $columns.find('option:eq(4)').removeAttr('selected').trigger('change');
    
    result = $queryResult.val();
    equal(result,"SELECT * FROM " + table);
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
    
    var result = $queryResult.val();
    
    equal(result, "SELECT " + columns.toString().replace(/,/g, ', ') + " FROM " + $usersTable.text() + ", " + $productsTable.text() + ", " + $storageTable.text());
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
    
    
    var result = $queryResult.val();
    equal("SELECT " + columns + " FROM " + table,result);
    
    $columns.find('option:eq(0)').removeAttr('selected').trigger('change');
    
    result = $queryResult.val();
    equal(result, "SELECT " + $usersTable.text() + "." + firstColumnText + " FROM " + $usersTable.text());
});


module( "Orderby tests" );

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
    equal(result, $queryResult.val());
    
    $('#wasc').removeAttr('checked');
    $('#wdesc').attr('checked','checked').trigger('change');
    
    result = "SELECT Users.Id FROM Users ORDER BY Users.Id DESC";
    equal(result, $queryResult.val());
    
    $orderby.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    result = "SELECT Users.Id FROM Users"; 
    equal(result, $queryResult.val());
});


module( "Groupby tests" );

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
    equal(result, $queryResult.val());
    
    $orderby.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    result = "SELECT Users.Id FROM Users"; 
    equal(result, $queryResult.val());
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
    equal(result, $queryResult.val());
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

    equal(result, $queryResult.val());
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
    equal(result, $queryResult.val());
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
    equal(result, $queryResult.val());
});

test("Should show the correct query after delete a spare column", function () {
    $usersTable.attr('selected', 'selected').trigger('change');

    $spareName.val('name_test');
    $spareColumn.find('option:eq(1)').attr('selected', 'selected');
    $createSpare.trigger('click');

    $spares.find('option:eq(0)').attr('selected', 'selected');
    $deleteSpare.trigger('click');

    var result = 'SELECT * FROM ' + $usersTable.val();
    equal(result, $queryResult.val());
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

    equal(result, $queryResult.val());
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
    equal(result, $queryResult.val());
    ok($spares.find('option').length === 0);
});