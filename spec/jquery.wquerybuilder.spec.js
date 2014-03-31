var $tables, $columns, $queryResult, $usersTable, $productsTable, $storageTable, $orderby, $orderbyOptions;

QUnit.begin(function(){
    $tables = $('[name="wtables"]');
    $columns = $("[name='wcolumns']");
    $queryResult = $('[name="wresult"]');
    $usersTable = $('[name="wtables"] option:eq(0)');
    $productsTable = $('[name="wtables"] option:eq(1)');
    $storageTable = $('[name="wtables"] option:eq(2)');
    $orderby = $("[name='worderby']");
});

QUnit.testDone(function( details ) {
    $('#querybuilder').wquerybuilder("clean");
});

module( "Tables and Columns tests" );
test("should show the correct query after select a table",function(){
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

test("should show the correct query after select and unselect columns",function(){
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
    
    columns = $columns.val();
    result = $queryResult.val();
    equal(result,"SELECT * FROM " + table);
});

test("should show the correct query after select and unselect multiple tables and columns",function(){
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

test("should show the correct query after select and unselect only first column of two tables", function(){
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

test("should populate orderby selectbox after select a column",function(){
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

test("should populate orderby selectbox after select a column of two types of tables",function(){
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

test("should show the correct query after select to order by ASC or DESC ",function(){
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

test("should populate groupby selectbox after select a column",function(){
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

test("should populate groupby selectbox after select a column of two types of tables",function(){
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

test("should show the correct query after select to groubp by",function(){
    $usersTable.attr('selected','selected').trigger('change');
    $columns.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    $orderby.find('option:eq(1)').attr('selected','selected').trigger('change');
    
    var result = "SELECT Users.Id FROM Users ORDER BY Users.Id ASC";
    equal(result, $queryResult.val());
    
    $orderby.find('option:eq(0)').attr('selected','selected').trigger('change');
    
    result = "SELECT Users.Id FROM Users"; 
    equal(result, $queryResult.val());
});