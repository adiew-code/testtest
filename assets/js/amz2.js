var dTable;
var current_table = "rankings";
var redirection_edit_table_old = "";
var last_filter = "All Products";

var review_trader_show_running_listings_only = 0;

var emailing_voucher_status = 0;

var report_json;

$(function() {
    $('.nav-inner .has-tooltip').tooltip({html: true});
    $('#addProductsModal .has-tooltip').tooltip({html: true});

    refresh_table(heading);
    if (nag) show_account(false);

    // $('#addProductsModal textarea').on('keyup', function() {
    //     if ($(this).val() == '') $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
    //     else $('#addProductsModal .modal-add-products-button').removeAttr('disabled');
    // });

    $('.modal-delete-button').click(function() {

        $('#deleteModal .modal-delete-button').html('<i class="fa fa-spin fa-spinner"></i> Please wait');
        $('#deleteModal .modal-footer .btn').attr('disabled', 'disabled');

        $.ajax({
            url: "delete.php",
            method: 'POST',
            cache: false,
            data: { id: $('#deleteModal input[name=delete_id]').val(), table: $('#deleteModal input[name=delete_table]').val() },
            success: function(data) {
                $('#deleteModal .modal-delete-button').html('Delete');
                $('#deleteModal .modal-footer .btn').removeAttr('disabled');
                $('#deleteModal').modal('hide');

                if ($('#deleteModal input[name=delete_table]').val() == "tbl_keyword") refresh_table("Keyword Deleted");
                if ($('#deleteModal input[name=delete_table]').val() == "tbl_product") refresh_table("Product Deleted");
                if ($('#deleteModal input[name=delete_table]').val() == "tbl_report") refresh_table("Report Deleted");
                if ($('#deleteModal input[name=delete_table]').val() == "tbl_auto_suggest") refresh_table("Auto Suggest Deleted");
                if ($('#deleteModal input[name=delete_table]').val() == "tbl_iq") refresh_table("Product Deleted");
                if ($('#deleteModal input[name=delete_table]').val() == "tbl_redirection") refresh_table("Super URL Deleted");
            }
        });

    });

    $('.modal-add-products-button').click(function() {

        if ($('#addProductsModal textarea').val().length == 0) {
            alert("You must enter an ASIN or product URL.");
            return;
        }

        $('#addProductsModal .modal-add-products-button').html('<i class="fa fa-spin fa-spinner"></i> Please wait');
        $('#addProductsModal .modal-footer .btn').attr('disabled', 'disabled');
        $('#promotion_video').hide();

        $.ajax({
            url: "add_products.php",
            method: 'POST',
            cache: false,
            data: $('#addProductsModal form').serialize(),
            success: function(data) {
                var result = $.parseJSON(data);
                $('#addProductsModal .modal-add-products-button').html('Add Products');
                $('#addProductsModal .modal-footer .btn').removeAttr('disabled');
                $('#addProductsModal').modal('hide');

                modify_table_row(result.products);

                // $.each(result.products, function(index, value) {
                //     $.ajax({
                //         url: "force_update_product.php",
                //         method: 'POST',
                //         cache: false,
                //         data: { product_id: value.product_id },
                //         success: function(data) {
                //             var result = $.parseJSON(data);
                //             modify_table_row(result.products);
                //         }
                //     });
                // });



                draw_alert(result.message);
            }
        });
    });

    $('.modal-add-job-button').click(function() {

        if ($('#addJobModal textarea').val().length == 0) {
            alert("You must enter your Job Requirements.");
            return;
        }

        $('#addJobModal .modal-add-job-button').html('<i class="fa fa-spin fa-spinner"></i> Please wait');
        $('#addJobModal .modal-footer .btn').attr('disabled', 'disabled');


        $.ajax({
            url: "add_job.php",
            method: 'POST',
            cache: false,
            data: $('#addJobModal form').serialize(),
            success: function(data) {

                $('#addJobModal .modal-add-job-button').html('Add Products');
                $('#addJobModal .modal-footer .btn').removeAttr('disabled');
                $('#addJobModal').modal('hide');
                refresh_table(data);
            }
        });
    });

    $('.modal-add-keywords-button').click(function() {
        $('#addKeywordsModal .modal-add-keywords-button').html('<i class="fa fa-spin fa-spinner"></i> Please wait');
        $('#addKeywordsModal .modal-footer .btn').attr('disabled', 'disabled');

        $.ajax({
            url: "add_keywords.php",
            method: 'POST',
            cache: false,
            data: {
                product_id: $('#addKeywordsModal input[name=product_id]').val(),
                keywords: $('#addKeywordsModal textarea[name=keywords]').val(),
                domain: $('#addKeywordsModal select[name=keyword_domain]') .val()
            },
            success: function(data) {

                $('#addKeywordsModal .modal-add-keywords-button').html('Add Keywords');
                $('#addKeywordsModal .modal-footer .btn').removeAttr('disabled');

                if (data == "Over keyword limit") {
                    message_modal('Over Keyword Limit', '<p>Your account limit does not allow for this many keywords. Please upgrade your account or add less keywords.<p><p><span style="text-decoration:underline; cursor:pointer;" onclick="$(\'.modal\').modal(\'hide\'); show_account(false)">Click to upgrade account</span></p>', 'OK');
                    return;
                }
                else {
                    $('#addKeywordsModal').modal('hide');

                    refresh_table(data);
                }
            }
        });

    });

    $('.modal-save-product-button').click(function() {
        $('#editProductModal .modal-save-product-button').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
        $('#editProductModal .modal-footer .btn').attr('disabled', 'disabled');


        // Save Product Details

        $.ajax({
            url: "edit_product_modal_save.php",
            method: 'POST',
            cache: false,
            data: {
                table: serialize_redirection_table(),
                product_id: $('#editProductModal input[name=product_id]').val(),
                product_name: $('#editProductModal input[name=product_name]').val(),
                product_tags: $('#editProductModal input[name=product_tags]').val(),
                merchant_id: $('#editProductModal input[name=merchant_id]').val(),
            },
            success: function(data) {
                $('#editProductModal .modal-save-product-button').html('Save');
                $('#editProductModal .modal-footer .btn').removeAttr('disabled');
                $('#editProductModal').modal('hide');

                refresh_table(data);
            }
        });

    });

    $('.modal-save-job-button').click(function() {
        $('#editJobModal .modal-save-job-button').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
        $('#editJobModal .modal-footer .btn').attr('disabled', 'disabled');


        // Save Job Details

        $.ajax({
            url: "edit_job_modal_save.php",
            method: 'POST',
            cache: false,
            data: {
                product_id: $('#editJobModal input[name=product_id]').val(),
                job_title: $('#editJobModal input[name=job_title]').val(),
                job_type_id: $('#editJobModal select[name=job_type_id]').val(),
                job_description: $('#editJobModal textarea[name=job_description]').val(),
                job_price: $('#editJobModal input[name=job_price]').val(),
                job_task_num: $('#editJobModal input[name=job_task_num]').val(),
                job_time_period: $('#editJobModal input[name=job_time_period]').val(),
                job_checklist: $('#editJobModal textarea[name=job_checklist]').val(),
                user_skype_id: $('#editJobModal input[name=user_skype_id]').val(),
                job_post_id: $('#editJobModal input[name=job_post_id]').val(),

            },
            success: function(data) {

                $('#editJobModal .modal-save-product-button').html('Save');
                $('#editJobModal .modal-footer .btn').removeAttr('disabled');
                $('#editJobModal').modal('hide');

                refresh_table(data);
            }
        });

    });


    $('.alerts').unbind('click').click(function() {
        $('.alerts').fadeOut();
    });
});

function menu_hide() {
    $('.side-bar').css('left', '-250px');
    $('.hamburger-show').show();
    $('.top-fixed').css('padding-left', '73px')
    $('.container').css('padding-left', '20px')
}

function menu_show() {
    $('.side-bar').css('left', '0');
    $('.hamburger-show').hide();
    $('.top-fixed').css('padding-left', '290px');
    $('.container').css('padding-left', '270px')
}

function modify_table_row(rows_data) {
    if (current_table == "rankings") {
        $.each(rows_data, function(index, value) {

            var row_data = [
                "",
                value.name,
                value.keyword_count,
                value.sales_rank,
                value.top_rank,
                value.rank_change,
                "",
                value.product_id,
                value.tag,
                value.sales_rank_change,
                value.product_group,
                value.flag,
                value.asin,
                value.favorite,
                value.image_large,
                value.spy,
                value.review,
                value.review_count,
                value.domain,
                value.track_variations
            ];

            row_data["DT_RowId"] = "tr_product_" + value.product_id;
            row_data["DT_RowData"] = {
                'product-id': value.product_id,
                'tags': value.tag,
                'keyword-count': value.keyword_count
            };

            if ($("#tr_product_" + value.product_id).length == 0) {

                dTable.row.add(row_data);
            }
            else
            {
                var tr = $('#tr_product_' + value.product_id);
                var row = dTable.row( tr );
                var d = row.data();

                row.data(row_data);

            }
        });

    }

    dTable.draw();
    $('.table-main .has-tooltip').tooltip({html: true});
    amz_anonymize();
}

function show_graph(keyword_id) {

    var tr = $('#tr_keyword_' + keyword_id);
    var row = $('#tr_keyword_' + keyword_id).closest('table').dataTable().api().row(tr);


    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
    }
    else {
        // Open this row
        row.child( "<div id='keyword_graph_" + keyword_id + "'><i class='fa fa-spin fa-spinner'></i> Please Wait...</div>" ).show();
        tr.addClass('shown');

        $('#keyword_graph_' + keyword_id).parent().attr('style', 'background-color: #fff !important;');

        $.ajax({
            url: "graph_data.php",
            method: 'GET',
            cache: false,
            data: { keyword_id: keyword_id, history: $('.graph-history').val() },
            success: function(data) {

                var graphData = jQuery.parseJSON(data);

                if (graphData.graphData.length > 0) {

                    $('#keyword_graph_' + keyword_id).html('');

                    Morris.Line({
                        resize: true,
                        smooth: false,
                        hideHover: true,
                        ymax: -1,
                        element: 'keyword_graph_' + keyword_id,
                        data: graphData.graphData,
                        xkey: 'timestamp',
                        ykeys: ['rank'],
                        labels: ['Rank'],
                        xLabels: 'day',
                        yLabelFormat: function(y) {
                            if (y % 1 === 0) return -y;
                            else return "";
                        }
                    });
                }
                else {
                    $('#keyword_graph_' + keyword_id).html('No data available yet.');
                }
            }
        });

    }

}

function delete_product(product_id) {
    var product_name = $('.product_name_' + product_id).html();

    $('#deleteModal input[name=delete_id]').val(product_id);
    $('#deleteModal input[name=delete_table]').val('tbl_product');
    $('#deleteModal .delete-name').html(product_name);
    $('#deleteModal').modal('show');
}

function delete_keyword(keyword_id) {
    var keyword_name = $('#tr_keyword_' + keyword_id + '>td:nth-child(2)').html();

    $('#deleteModal input[name=delete_id]').val(keyword_id);
    $('#deleteModal input[name=delete_table]').val('tbl_keyword');
    $('#deleteModal .delete-name').html(keyword_name);
    $('#deleteModal').modal('show');
}

function delete_report(report_id) {
    var report_name = $('.report_' + report_id).html();

    $('#deleteModal input[name=delete_id]').val(report_id);
    $('#deleteModal input[name=delete_table]').val('tbl_report');
    $('#deleteModal .delete-name').html(report_name);
    $('#deleteModal').modal('show');
}

function delete_iq(iq_id) {
    var iq_name = $('#tr_iq_' + iq_id + '>td:nth-child(3)').html();

    $('#deleteModal input[name=delete_id]').val(iq_id);
    $('#deleteModal input[name=delete_table]').val('tbl_iq');
    $('#deleteModal .delete-name').html(iq_name);
    $('#deleteModal').modal('show');
}

function hide_all() {
    $('table[id^=table_product_]').dataTable().api().destroy();

    $('tr.shown').each(function() {
        var tr = $(this).closest('tr');
        var row = dTable.row( tr );
        row.child.hide();
        tr.removeClass('shown');
    });
}

function add_keywords(product_id) {
    $('#addKeywordsModal input[name=product_id]').val(product_id);
    $('#addKeywordsModal .inner-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#addKeywordsModal').modal('show');
    $('#addKeywordsModal .modal-footer .modal-add-keywords-button').prop('disabled', true);

    $.ajax({
        url: "add_keywords_modal.php",
        cache: false,
        method: 'POST',
        data: { product_id: product_id },
        success: function(data) {
            $('#addKeywordsModal .inner-body').html(data);
            $('#addKeywordsModal .modal-footer .modal-add-keywords-button').prop('disabled', false);

            $(this).hide();
        }
    });
}

function add_keyword_single(keyword, product_id, domain, redirection_keyword_id) {

    $.ajax({
        url: "add_keywords.php",
        method: 'POST',
        cache: false,
        data: {
            product_id: product_id,
            keywords: keyword,
            domain: domain
        },
        success: function(data) {

            var tr = $('#tr_redirection_keyword_' + redirection_keyword_id)
            var row = $('#tr_redirection_keyword_' + redirection_keyword_id).closest('table').dataTable().api().row(tr);
            var d = row.data();
            d[12] = 1;
            row.data(d);
        }

    });
}

function update_filter(column) {
    last_filter = $('.tag-filter').val();

    if ($('.tag-filter').val() == 'All Products') {
        dTable.column(column).search('').draw();
    }
    else dTable.column(column).search($('.tag-filter').val()).draw();
}

function show_keywords_all() {

    $('.table-main [id^=tr_product_]').each(function() {
        show_keywords_full($(this).data('product-id'), true);
    });

}

function hide_keywords_all() {

    $('.table-main [id^=tr_product_]').each(function() {
        product_id = $(this).data('product-id');

        var tr = $('#tr_product_' + product_id);
        var row = dTable.row( tr );

        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-product .glyphicon').addClass('glyphicon-chevron-right')
        $(tr).find('td.td-product .glyphicon').removeClass('glyphicon-chevron-down')
    });
}

function show_keywords(product_id) {
    show_keywords_full(product_id, false);
}

function show_keywords_full(product_id, force_show) {

    var tr = $('#tr_product_' + product_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {

        if (force_show) return;

        // This row is already open - close it
        $('#table_product_' + product_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
    }
    else {
        // Open this row

        row.child('<i class="fa fa-spin fa-spinner"></i> Please Wait...').show();
        $(tr).find('td .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

        $.ajax({
            url: "main-table-keywords.php",
            method: 'POST',
            cache: false,
            data: { product_id: product_id },
            success: function(data) {
                row.child( data ).show();

                tr.addClass('shown');

                $('#table_product_' + product_id).parent().css({ 'padding' : 0, 'height' : 0 });

                $('#table_product_' + product_id).DataTable({
                    "language": {
                        "zeroRecords": "<a href='javascript:void(0)' onclick='add_keywords(" + product_id + ")'>Click here to add keywords</a>"
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [5, 7, 8, 9, 10, 11 ] },
                        {
                            "targets": [ 4 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var change = "-";

                                    if (row[4] != "20000") {
                                        if (row[5] > 0) change = "<span style='color: #009f3c; font-weight: bold;' class='has-tooltip' title='Rank Change'>+" + row[5] + "</span>";
                                        if (row[5] < 0) change = "<span style='color: #FF0000; font-weight: bold;' class='has-tooltip' title='Rank Change'>" + row[5] + "</span>";
                                        if (row[5] == 0) change = "-";

                                        var rank = "<span style='font-weight: bold;' class='has-tooltip' title='Current Rank'>" + row[4] + "</span>";
                                        if (row[4] == '') rank = '<span class="has-tooltip" title="Not in top 300">> 300</span>';

                                        return "<div class='group'>" + rank + "</div>" +
                                            "<div class='group'>" + change + "</div>";
                                    }
                                    else return '<span class="glyphicon glyphicon-time has-tooltip" title="Keyword not updated yet. Won\'t be long!"></span>';
                                }
                                else {
                                    if (row[4] == "") return 10000;
                                    else return row[4];
                                }
                            }

                        },
                        {
                            "targets": [ 2 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = row[2];

                                    if (row[7] != '') display += "<p class='volume'><a href='http://" + row[9] + "/dp/" + row[7] + "' target='_blank'>" + row[7] + "</a></p>";
                                    if (row[8] != '') display += "<p class='volume has-tooltip' title='Est. monthly Google search volume'>Volume: " + row[8] + "</p>";

                                    return display;

                                }
                                else {
                                    return row[2];
                                }
                            }

                        },
                        {
                            "targets": [ 1 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[1] == 1) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[10] + " fav-on has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[10] + ", " + row[11] + ")'></span>";
                                    if (row[1] == 0) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[10] + " fav-off has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[10] + ", " + row[11] + ")'></span>";
                                }
                                else {
                                    return row[1];
                                }
                            }

                        }
                    ],
                    "drawCallback": function( settings ) {
                        var api = this.api();


                        if (api.rows().data().length == 0) {
                            $(api.table().header()).hide();
                        }
                    }

                });

                $('#table_product_' + product_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();


                $('#table_product_' + product_id + ' [id^=mini_graph_]').each(function() {

                    var keyword_id = $(this).closest('tr').data('keyword-id');

                    $(this).html("<i class='fa fa-spin fa-spinner'></i>");

                    $.ajax({
                        url: "graph_data.php",
                        method: 'GET',
                        cache: false,
                        data: { keyword_id: keyword_id, history: 'weekly' },
                        success: function(data) {

                            var graphData = jQuery.parseJSON(data);

                            if (graphData.graphData.length > 0) {

                                $('#mini_graph_' + keyword_id).html('');

                                Morris.Line({
                                    resize: true,
                                    smooth: false,
                                    axes: false,
                                    grid: false,
                                    hideHover: 'always',
                                    lineWidth: 1,
                                    pointSize: 2,
                                    element: 'mini_graph_' + keyword_id,
                                    data: graphData.graphData,
                                    xkey: 'timestamp',
                                    ykeys: ['rank'],
                                    labels: ['Rank'],
                                    xLabels: 'day',
                                    yLabelFormat: function(y) {
                                        if (y % 1 === 0) return -y;
                                        else return "";
                                    }
                                });
                            }
                            else {
                                $('#mini_graph_' + keyword_id).html('');
                            }



                        }
                    });

                });
            }
        });
    }

}

function refresh_table(message) {

    if (current_table == "sales") show_sales(message);
    else if (current_table == "redirection") show_redirection(message);
    else if (current_table == "stumbleupon") show_advanced_super_url(message);
    else if (current_table == "reviews") show_reviews(message);
    else if (current_table == "iq") show_iq(message);
    else if (current_table == "job_market") show_job_market(message);

    else if (current_table == "review_trader") {
        dTable.ajax.reload( null, false );
        draw_alert(message);
    }
    else if (current_table == "reports") show_reports(message);
    else if (current_table == "smasher") show_smasher(message);
    else    refresh_rank_table(message);
}

function refresh_rank_table(message) {

    current_table = "rankings";
	
    var tables = $.fn.dataTable.fnTables(true);
	
    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.content').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .rankings-icon').addClass('active');


    $.ajax({
        url: "main-table.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('.container').html(data);

            if (data == '') {
                $('#addProductsModal .close').hide();
                $('#addProductsModal .btn-default').hide();
                // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
                $('#addProductsModal').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
            else {
                $('#addProductsModal .close').show();
                $('#addProductsModal .btn-default').show();

                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": true,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [ 2, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '<div class="chev-star">';

                                    display += '<span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_keywords(' + row[7] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row[13] == 0) display += ' fav-off ';
                                    if (row[13] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row[7] + '" onclick="toggle_product_favorite(' + row[7] + ', 13)"></span>';
                                    display += '</div>';

                                    if (row[14] != '') display += '<img src="' + row[14] + '" class="product-image" onclick="show_keywords(' + row[7] + ')">';

                                    return display;
                                }
                                else return 1-row[13];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '';

                                    display += '<div onclick="show_keywords(' + row[7] +')" style="height: 100%;"><p class="product_name_' + row[7] + '">';

                                    if (row[1] != "") display += row[1];
                                    else display += "<span class='glyphicon glyphicon-time' style='margin: 0 7px 0 0;'></span> <span style='color: #bbb'>Collecting data. Won't be long!</span>";

                                    display += '</p><p class="asin"><img src="images/flags/' + row[11] + '.png" style="margin-right: 10px;">';

                                    if (row[19] == 1) display += '<span style="font-weight: bold">';
                                    else display += '<span>';

                                    display += row[12] + '</span>';

                                    if (row[8] != "") display += " / " + row[8] + "</p>";

                                    display += '</div>';

                                    return display;
                                }

                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "hidden-xs hidden-sm",
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-ranking",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[2] != 0) {
                                        var change = "-";
                                        if (row[5] > 0) change = "<span style='color: #009f3c; font-weight: bold;'>+" + row[5] + "</span>";
                                        if (row[5] < 0) change = "<span style='color: #FF0000; font-weight: bold;'>" + row[5] + "</span>";
                                        if (row[5] == 0) change = "-";

                                        var rank = "<span style='font-weight: bold;'>" + row[4] + "</span>";

                                        return "<div class='group'><div class='has-tooltip' title='Highest rank of your keywords'>" + rank + "<div style='color: #999; font-size: 10px; margin-top: 5px;'>Top</div></div></div>" +
                                            "<div class='group'><div class='has-tooltip' title='Total change in keyword ranks over past 12 hours'>" + change + "<div style='color: #999; font-size: 10px; margin-top: 5px;'>Change</div></div></div>";
                                    }
                                    else {
                                        return '<a href="javascript:void(0)" onclick="add_keywords(' + row[7] + ')">Click here to add keywords</a>';
                                    }
                                }
                                else return row[4];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "td-sales-rank",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var sales_rank = row[3];
                                    if (sales_rank == 0) sales_rank = "-";

                                    return '<div class="has-tooltip" title="Sales Rank / Rank Change.<br>Click to see Sales Rank Graph" onclick="show_product_details(' + row[7] + ')" style="cursor: pointer;">' +
                                        sales_rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br>' + row[9].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                                        '</div>' +
                                        '<p class="product_group">' + row[10] + '</p>';
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 6 ],
                            "class": "td-action",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display ='<span class="glyphicon glyphicon-plus has-tooltip" onclick="add_keywords(' + row[7] + ')" title="Add Keywords"></span>';

                                    if (row[15] == 1) {
                                        display += '<span class="glyphicon glyphicon-search has-tooltip" style="color: #009f3c" onclick="show_inventory(' + row[7] + ')" title="Sales tracking is ON."></span>';
                                    }
                                    else {
                                        display += '<span class="glyphicon glyphicon-search has-tooltip" onclick="show_inventory(' + row[7] + ')" title="Click to ENABLE monitoring of sales."></span>';
                                    }

                                    if (row[16] == 1) {
                                        display += '<span style="position: relative">';
                                        display += '<span class="glyphicon glyphicon-heart has-tooltip" style="color: #ff6666; margin-left: 7px;" onclick="review_toggle(' + row[7] + ')" title="Review tracking is ON. Click to disable."></span>';

                                        if (row[17] > 0) {
                                            display += '<span class="review-counter review_counter_' + row[7] + ' has-tooltip" title="Count of the reviews for this product" onclick="show_reviews(\"\")">' + row[17] + '</span>';
                                        }

                                        display += '</span>';
                                    }
                                    else {
                                        display += '<span class="glyphicon glyphicon-heart has-tooltip" style="margin-left: 7px;" onclick="review_toggle(' + row[7] + ')" title="Click to ENABLE monitoring of reviews."></span>';
                                    }

                                    display += '<span class="glyphicon glyphicon-pencil has-tooltip" onclick="edit_product(' + row[7] + ')" title="Edit Product"></span>';
                                    display += '<a href="http://' + row[18] + '/dp/' + row[12] + '" target="_blank"><span class="glyphicon glyphicon-new-window has-tooltip" title="Open product in Amazon"></span></a>';
                                    display += '<span class="glyphicon glyphicon-trash has-tooltip" onclick="delete_product(' + row[7] + ')" title="Delete Product"></span>';

                                    return display;

                                }
                                else return row[17];
                            }
                        }
                    ],
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();


                draw_alert(message);
            }

        }
    });
}

function draw_alert(message, style) {

    if (style == "green") {
        $('.alerts').css('background-color', '#1abc9c');
    }
    else {
        $('.alerts').css('background-color', '#33393D');
    }

    if (message != '') {
        $('.alerts').hide().html(message).fadeIn();
    }

    var exists = 0;

    $('.tag-filter option').each(function() {
        if ($(this).html() == last_filter) {
            $('.tag-filter').val(last_filter).trigger('change');
            exists = 1;
        }
    });

    if (!exists) {
        last_filter = "All Products";
    }

    update_review_count();
    update_review_trader_count();

    $('.nav-inner .fa.active').parent('li').addClass('active');
    $('.nav-inner .fa:not(.active)').parent('li').removeClass('active');
}

function update_review_count() {
    $.ajax({
        url: "review_count.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            if ((data == 0) || (!isInt(data))) $('.review-counter-main').html('').hide();
            else $('.review-counter-main').html(data).show();
        }
    });
}


function update_review_trader_count() {
    $.ajax({
        url: "review_trader_count.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            if ((data == 0) || (!isInt(data))) $('.review-trader-counter-main').html('').hide();
            else $('.review-trader-counter-main').html(data).show();
        }
    });
}

function show_account(update_cc) {
    $('#accountModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#accountModal').modal('show');

    $.ajax({
        url: "account_modal.php",
        cache: false,
        success: function(data) {
            $('#accountModal .modal-body').html(data);
            $('#accountModal input[name=account_plan]').val($('#accountModal select[name=account_plan]').val());
            if (update_cc) $('#accountModal a[href="#update-cc"]').tab('show');

            $('#accountModal .has-tooltip').tooltip({html: true});
        }
    });

}


// Account Functions

function save_account_details() {
    $('#accountModal .btn-save-details').html('<i class="fa fa-spin fa-spinner"></i> Please wait').attr('disabled', 'disabled');

    $.ajax({
        url: "account_save.php",
        method: 'POST',
        cache: false,
        data: {
            token: $('#accountModal input[name=_token]').val(),
            email: $('#accountModal input[name=account_email]').val(),
            old_password: $('#accountModal input[name=old_password]').val(),
            new_password: $('#accountModal input[name=new_password]').val()
        },
        success: function(data) {
            draw_alert(data);

            $('#accountModal .btn-save-details').html('Save Details').removeAttr('disabled');
            $('#accountModal').modal('hide');
        }
    });
}

function change_plan_trial() {
    $('.confirm-change-plan .upgrade-plan-message-trial').show();
    $('.confirm-change-plan .confirm-price').html('');
    change_plan_verify_show('monthly', 1);
}

function change_plan_paid(interval) {

    if ($('#accountModal .plans-drop-down:visible').find('option:selected').data('needs-confirm') == "1") {
        var plan_price = $('#accountModal .plans-drop-down:visible').find('option:selected').data('price');
        var voucher_limit = $('#accountModal .plans-drop-down:visible').find('option:selected').data('vouchers');
        $('.confirm-change-plan .confirm-price').html('$' + plan_price + ' ');
        $('.confirm-change-plan .confirm-additional-vouchers').html(voucher_limit);
        $('.confirm-change-plan .upgrade-plan-message-trial').hide();
        change_plan_verify_show(interval, 0);
    }
    else {
        change_plan(interval, 0);
    }
}

function change_plan_verify_show(interval, end_trial) {
    $('.confirm-change-plan').show();
    $('.current-account').hide();
    $('.change-plans').hide();

    $('.confirm-change-plan .btn-primary').attr('onclick', 'change_plan_verify("' + interval + '", ' + end_trial + ')');
}

function change_plan_verify(interval, end_trial) {
    if (!$('#confirm-change-plan-check').is(':checked')) {
        alert('You must agree to the terms by ticking the check box.');
        return;
    }
    if ($('input[name=confirm_change_plan_password]').val() == '') {
        alert('You must enter your sign in password to authorize this plan change.')
        return;
    }

    change_plan(interval, end_trial);
}

function confirm_change_plan_cancel() {
    $('#confirm-change-plan-check').prop('checked', false);
    $('input[name=confirm_change_plan_password]').val('');
    $('.confirm-change-plan').hide();
    $('.current-account').show();
}

function change_plan(interval, end_trial) {
    $('#accountModal .btn-change-plan').html('<i class="fa fa-spin fa-spinner"></i> Please wait').attr('disabled', 'disabled');
    $('#accountModal .confirm-change-plan .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please wait').attr('disabled', 'disabled');

    var authorize_pw = "no_pw";
    if ($('input[name=confirm_change_plan_password]').val() != '') authorize_pw = $('input[name=confirm_change_plan_password]').val();

    $.ajax({
        url: "account_change_plan.php",
        method: 'POST',
        cache: false,
        data: {
            plan: $('#accountModal .pay-' + interval + ' .plans-drop-down').val(),
            interval: interval,
            authorize_pw: authorize_pw,
            end_trial: end_trial
        },
        success: function(data) {
            console.log(data);
            draw_alert(data, 'green');

            $('#accountModal .btn-change-plan').html('Change Plan').removeAttr('disabled');
            $('#accountModal .confirm-change-plan .btn-primary').html('Change Plan').removeAttr('disabled');
            $('#accountModal').modal('hide');
        }
    });
}

function update_cc() {

    $('.form-errors').html('');
    $('.btn-update-cc').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');

    Stripe.setPublishableKey(stripe_public);
    Stripe.card.createToken({
        number: $('input[name=cc_number]').val(),
        cvc: $('input[name=cc_ccv]').val(),
        exp_month: $('select[name=cc_month]').val(),
        exp_year: $('select[name=cc_year]').val()
    }, stripeResponseHandler);
}

function stripeResponseHandler(status, response) {


    if (response.error) {

        // Show the errors on the form
        $('.form-errors').html(response.error.message);
        $('.btn-update-cc').html('Update Credit Card').removeAttr('disabled');

    } else {

        $.ajax({
            url: "account_update_cc.php",
            method: 'POST',
            cache: false,
            data: { stripeToken: response.id },
            success: function(data) {
                $('.btn-update-cc').html('Update Credit Card').removeAttr('disabled');
                $('#accountModal').modal('hide');

                draw_alert(data);
            }
        });
    }
}

function get_invoices() {

    $('#accountModal #invoices').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');

    $.ajax({
        url: "invoices_list.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('#accountModal #invoices').html(data);

        }
    });

}


function add_products(from_var) {

    //$('#addProductsModal textarea').val('');
    //$('#addProductsModal input[name=product_tags]').val('');
    // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
    $('#addProductsModal input[name=from]').val(from_var);
    $('#addProductsModal').modal('show');
}

function add_job(from_var) {
    $('#addJobModal textarea').val('');
    $('#addJobModal input').val('');

    // $('#addJobModal .modal-add-products-button').attr('disabled', 'disabled');
    /*$('#addJobModal input[name=from]').val(from_var);*/


    $('#addJobModal').modal('show');
}

function show_suggestions(product_id) {
    $('#suggestionsModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#suggestionsModal .btn-add-suggestions, #suggestionsModal .btn-remove-suggestions').hide();
    $('#suggestionsModal .modal-footer .btn').removeAttr('disabled');
    $('#suggestionsModal .btn-add-suggestions').html('Add Suggestions');

    $('#suggestionsModal').modal('show');

    $.ajax({
        url: "suggestions_get.php",
        method: 'GET',
        cache: false,
        data: { product_id: product_id },
        success: function(data) {
            $('#suggestionsModal .modal-body').html(data);
            $('#suggestionsModal .btn-add-suggestions, #suggestionsModal .btn-remove-suggestions').show();
        }
    });
}

function add_suggestions() {
    $('#suggestionsModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#suggestionsModal .btn-add-suggestions').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');


    $.ajax({
        url: "add_keywords.php",
        method: 'POST',
        cache: false,
        data: {
            product_id: $('#suggestionsModal input[name=product_id]').val(),
            keywords: $('#suggestionsModal textarea[name=keywords]').val(),
            domain: $('#suggestionsModal select[name=keyword_domain]') .val()
        },
        success: function(data) {
            $('#suggestionsModal .modal-footer .btn').removeAttr('disabled');
            $('#suggestionsModal .btn-add-suggestions').html('Add Suggestions');
            $('#suggestionsModal').modal('hide');

            refresh_table(data);
        }
    });
}

function remove_suggestions() {
    $('#suggestionsModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#suggestionsModal .btn-remove-suggestions').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');


    $.ajax({
        url: "suggestions_remove.php",
        method: 'POST',
        cache: false,
        data: $('#suggestionsModal form').serialize(),
        success: function(data) {
            $('#suggestionsModal .modal-footer .btn').removeAttr('disabled');
            $('#suggestionsModal .btn-remove-suggestions').html('Not Interested In These Keywords');
            $('#suggestionsModal').modal('hide');

            if (data != '') refresh_table(data);
        }
    });

}

function update_suggestion_textarea() {
    var textarea = '';
    $('#suggestionsModal [id^=check_suggestion_]:checked').each(function() {
        textarea += $('#suggestionsModal [for=' + $(this).attr('id') + ']').html() + '\r\n';
    });

    $('#suggestionsModal textarea').val(textarea);

    if (textarea == '') {
        $('#suggestionsModal .btn-add-suggestions').attr('disabled', 'disabled');
        $('#suggestionsModal .btn-remove-suggestions').attr('disabled', 'disabled');
    }
    else {
        $('#suggestionsModal .btn-add-suggestions').removeAttr('disabled');
        $('#suggestionsModal .btn-remove-suggestions').removeAttr('disabled');
    }
}



// Keyword Research Functions

function keyword_research(product_id) {


    $('.modal').modal('hide');

    $('#keywordResearchModal .modal-body').html('<div style="padding-top:20px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div>');
    $('#keywordResearchModal').modal('show');

    $.ajax({
        url: "suggestions.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id },
        success: function(data) {
            $('#keywordResearchModal .modal-body').html(data);
        }
    });

}

function update_suggestion_seed() {

    $('#keyword-research textarea[name=keywords]').val('');
    $('#keyword-research .suggestions-list').html('');

    $.ajax({
        url: "suggestions_get_seed.php",
        method: 'POST',
        cache: false,
        data: { product_id: $('#keyword-research select[name=suggestion-product-id]').val() },
        success: function(data) {
            $('#keyword-research textarea[name=seed]').val(data);
        }
    });
}

function generate_suggestions() {
    $('#keyword-research .btn-generate-suggestions').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');

    console.log('a');

    $.ajax({
        url: "suggestions_json.php",
        method: 'POST',
        cache: false,
        data: {
            suggestions: $('#keyword-research textarea[name=seed]').val(),
            product_id: $('#keyword-research select[name=suggestion-product-id]').val(),
            domain: $('#keyword-research select[name=domain]').val()
        },
        success: function(data) {
            console.log('b');
            console.log(data);

            obj = jQuery.parseJSON(data);


            $('#keyword-research .suggestions-list').html('');

            if (obj.length > 0) {

                var count = 0;

                $('#keyword-research .suggestions-list').append('<div class="checkbox check-white"> <input id="check_all" type="checkbox" onclick="select_all_suggestions()"> <label for="check_all" style="font-weight: bold;">Select All</label> </div>');

                jQuery.each(obj, function() {
                    $('#keyword-research .suggestions-list').append('<div class="checkbox check-white"> <input id="check_suggestion_' + count+ '" type="checkbox" name="suggestion[]" value="' + this.toString() + '"> <label for="check_suggestion_' + count + '">' + this.toString() + '</label> </div>')
                    count++;
                });
            }
            else {
                $('#keyword-research .suggestions-list').html('No suggestions found. Try different seed keywords.');
            }



            $('#keyword-research .btn-generate-suggestions').html('Generate Suggestions').removeAttr('disabled');
        }
    });
}

function copy_to_seed() {

    var seed_list = "";

    $('#keyword-research [id^=check_suggestion_]:checked').each(function() {
        seed_list += $(this).val() + '\r\n';
    });

    $('#keyword-research textarea[name=seed]').val(seed_list);
}

function add_to_keywords() {

    var keywords_list = "";

    $('#keyword-research [id^=check_suggestion_]:checked').each(function() {
        keywords_list += $(this).val() + '\r\n';
    });

    $('#keyword-research textarea[name=keywords]').val(keywords_list + $('#keyword-research textarea[name=keywords]').val());
}

function add_keyword_suggestions() {
    $('#keyword-research .btn-add-keyword-suggestions').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');


    $.ajax({
        url: "add_keywords.php",
        method: 'POST',
        cache: false,
        data: {
            product_id: $('#keyword-research select[name=suggestion-product-id]').val(),
            keywords: $('#keyword-research textarea[name=keywords]').val()
        },
        success: function(data) {

            $('#keyword-research .btn-add-keyword-suggestions').html('<span class="glyphicon glyphicon-plus"></span> Add Keywords</button>').removeAttr('disabled');

            if (data == "Over keyword limit") {
                message_modal('Over Keyword Limit', '<p>Your account limit does not allow for this many keywords. Please upgrade your account or add less keywords.<p><p><span style="text-decoration:underline; cursor:pointer;" onclick="$(\'.modal\').modal(\'hide\'); show_account(false)">Click to upgrade account</span></p>', 'OK');
                return;
            }
            else {
                $('#keyword-research textarea[name=keywords]').val('');
                $('#keywordResearchModal').modal('hide');

                refresh_table(data);
            }

        }
    });
}

function select_all_suggestions() {
    if ($('#keyword-research input[id=check_all]').is(':checked')) $('input[id^=check_suggestion_]').prop('checked', true);
    else $('input[id^=check_suggestion_]').prop('checked', false);
}

function copy_keywords_from() {

    if ($('#addKeywordsModal select[name=copy-keywords-from]').val() == -1) return;


    $.ajax({
        url: "add_keywords_copy.php",
        method: 'POST',
        cache: false,
        data: { product_id: $('#addKeywordsModal select[name=copy-keywords-from]').val() },
        success: function(data) {
            $('#addKeywordsModal textarea[name=keywords]').val(data);
        }
    });
}


// Reports function

function show_reports(message) {

    current_table = "reports";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .reports-icon').addClass('active');

    $.ajax({
        url: "reports_list.php",
        method: 'GET',
        cache: false,
        success: function(data) {

            $('.container').html(data);

            dTable = $('.table-main').DataTable({
                "pagingType": "full_numbers",
                "language": {
                    "lengthMenu": "_MENU_",
                    "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                    "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                },

                "dom": 'lfrtpi',
                "processing": false,
                "autoWidth": false,
                "pageLength": 50,
                "paging": false,
                "info": false
            });

            draw_alert(message);
            $('.table-main .has-tooltip').tooltip({html: true});
            amz_anonymize();

        }
    });

}

function edit_report(report_id) {

    $('#reportModal .btn-save-report').html('Save Report').attr('disabled', false);

    $('#reportModal .nav-tabs li').removeClass('active');
    $('#reportModal .nav-tabs li:first').addClass('active');
    $('#reportModal .tab-pane').removeClass('active');
    $('#reportModal #details').addClass('active');

    $('#reportModal .modal-body form').hide();
    $('#reportModal .modal-footer').hide();
    $('#reportModal .modal-body').append('<div class="wait-class"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div>');
    $('#reportModal').modal('show');

    $.ajax({
        url: "report.php",
        method: 'GET',
        cache: false,
        data: { report_id: report_id },
        success: function(data) {
            if (data == '') {
                $('#reportModal').modal('hide');
                message_modal('There was a problem with this report.', 'Please report this problem to support@amztracker.com');
                return;
            }

            report_json = JSON.parse(data);

            $('#reportModal input[name=report_id]').val(report_json.report.report_id);
            $('#reportModal input[name=report_name]').val(report_json.report.report_name);
            $('#reportModal input[name=from_name]').val(report_json.report.from_name);
            $('#reportModal input[name=from_email]').val(report_json.report.from_email);
            $('#reportModal textarea[name=to_email]').html(report_json.report.to_email);
            $('#reportModal select[name=email_frequency]').val(report_json.report.email_frequency);
            $('#reportModal .input-append.date').data(report_json.report.next_email);
            $('#reportModal input[name=next_email]').val(report_json.report.next_email);

            $('#reportModal .modal-body form').show();
            $('#reportModal .modal-footer').show();
            $('#reportModal .wait-class').remove();

            $('#reportModal #keywords .table-report-products tbody tr').remove();
            $('#reportModal #keywords .report_product_section tbody tr').remove();

            $.each(report_json.products, function() {

                if (typeof this.keywords != "undefined") {
                    var tr = '<tr class="report_tr_product_' + this.product_id + '" data-product_id="' + this.product_id + '" onclick="report_change_product(' + this.product_id + ')">';
                    tr += '<td>' + this.name + '</td></tr>';

                    $('#reportModal #keywords .table-report-products tbody').append(tr);
                }
            });

            $('.input-datepicker').datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
                orientation: "top auto"
            });


        }
    });
}

function report_check_all() {
    var product_id = $('#reportModal .table-report-products tbody tr.tr_active').data('product_id');
    var selected = $('#reportModal .report_product_section #check_keyword_all').is(':checked');

    $('#reportModal .report_product_section tbody input[type=checkbox]').prop('checked', selected);

    if (selected) selected = 1;
    else selected = 0;

    $('#reportModal .report_product_section tbody input[type=checkbox]').each(function() {
        var keyword_id = $(this).val();
        report_json.products[product_id].keywords[keyword_id].selected = selected;
    });
}

function report_check_keyword(keyword_id) {
    var product_id = $('#reportModal .table-report-products tbody tr.tr_active').data('product_id');
    var selected = $('#reportModal #check_keyword_keyword_id_' + keyword_id).is(':checked');

    if (selected) {
        report_json.products[product_id].keywords[keyword_id].selected = 1;
    }
    else {
        report_json.products[product_id].keywords[keyword_id].selected = 0;
    }
}

function report_change_product(product_id) {
    $('#reportModal .report_product_section tbody tr').remove();
    $('#reportModal .table-report-products tbody tr').removeClass('tr_active');
    $('#reportModal .report_tr_product_' + product_id).addClass('tr_active');

    $.each(report_json.products[product_id].keywords, function(id, keyword) {

        var tr = '<tr> <td style="width:40px;"> <div class="checkbox check-white" style="margin: 0;">';

        tr += '<input id="check_keyword_keyword_id_' + id +'" type="checkbox" value="' + id +'" name="keywords[]" onclick="report_check_keyword(' + id + ')"';

        if (keyword.selected == 1) tr += ' checked';

        tr += '>';
        tr += '<label for="check_keyword_keyword_id_' + id + '"></label></div></td>';
        tr += '<td>' + keyword.keyword + '</td>';
        tr += '<td style="width: 100px; text-align:center;">' + keyword.rank + ' / ' + keyword.change + '</td> </tr>';

        $('#reportModal .report_product_section tbody').append(tr);

    });
}

function save_report() {
    var keywords = [];

    $.each(report_json.products, function(key, product) {
        if (typeof product.keywords !== 'undefined') {
            $.each(product.keywords, function(key, keyword) {
                if (keyword.selected == 1) keywords.push(key);
            });
        }
    });

    $('#reportModal .btn-save-report').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');

    $.ajax({
        url: "report_save.php",
        method: 'POST',
        cache: false,
        data: {
            report_id: report_json.report.report_id,
            keywords: keywords,
            report_name: $('#reportModal input[name=report_name]').val(),
            from_name: $('#reportModal input[name=from_name]').val(),
            from_email: $('#reportModal input[name=from_email]').val(),
            to_email: $('#reportModal textarea[name=to_email]').val(),
            email_frequency: $('#reportModal select[name=email_frequency]').val(),
            next_email: $('#reportModal input[name=next_email]').val(),

        },
        success: function(data) {
            console.log(data);
            $('#reportModal .btn-save-report').html('Save Report').removeAttr('disabled');
            show_reports('Report Saved');
            $('#reportModal').modal('hide');
        }
    });
}

function report_preview() {

    var keywords = [];

    $.each(report_json.products, function(key, product) {
        if (typeof product.keywords !== 'undefined') {
            $.each(product.keywords, function(key, keyword) {
                if (keyword.selected == 1) keywords.push(key);
            });
        }
    });


    $('#reportModal #preview').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');

    $.ajax({
        url: "report_email.php",
        method: 'POST',
        cache: false,
        data: {
            report_id: report_json.report.report_id,
            keywords: keywords,
            report_name: $('#reportModal input[name=report_name]').val(),
            from_name: $('#reportModal input[name=from_name]').val(),
            from_email: $('#reportModal input[name=from_email]').val(),
            to_email: $('#reportModal textarea[name=to_email]').val(),
            email_frequency: $('#reportModal select[name=email_frequency]').val(),
            next_email: $('#reportModal input[name=next_email]').val(),
        },
        success: function(data) {
            $('#reportModal #preview').html(data);
            $('#reportModal #preview').append('<button type="button" class="btn btn-warning btn-send-email-now" style="margin-top: 20px;" onclick="send_email_now()">Send Email Now</button>');
        }
    });
}

function send_email_now() {
    $('#reportModal .btn-send-email-now').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');

    if ($('#reportModal input[name=report_id]').val() != -1) {

        $.ajax({
            url: "report_csv.php?report_id=" + $('#reportModal input[name=report_id]').val(),
            success: function(data) {

                $.ajax({
                    url: "send_email.php",
                    method: 'POST',
                    cache: false,
                    data: {
                        to_email: $('#reportModal textarea[name=to_email]').val(),
                        report_name: $('#reportModal input[name=report_name]').val(),
                        from_email: $('#reportModal input[name=from_email]').val(),
                        from_name: $('#reportModal input[name=from_name]').val(),
                        body: $('#reportModal #email-body').html(),
                        attachment: data,
                        attachment_name: 'report.csv'
                    },
                    success: function(data) {
                        $('#reportModal .btn-send-email-now').html(data).removeAttr('disabled');
                    }
                });

            }
        });
    }
    else {

        $.ajax({
            url: "send_email.php",
            method: 'POST',
            cache: false,
            data: {
                to_email: $('#reportModal textarea[name=to_email]').val(),
                report_name: $('#reportModal input[name=report_name]').val(),
                from_email: $('#reportModal input[name=from_email]').val(),
                from_name: $('#reportModal input[name=from_name]').val(),
                body: $('#reportModal #email-body').html()
            },
            success: function(data) {
                $('#reportModal .btn-send-email-now').html(data).removeAttr('disabled');
            }
        });

    }
}

// Product Details

function show_product_details(product_id) {
    $('#productDetailsModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#productDetailsModal').modal('show');

    $.ajax({
        url: "product_details.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id },
        success: function(data_modal) {
            $('#productDetailsModal .modal-dialog').html(data_modal);

            setTimeout(function() {

                $.ajax({
                    url: "graph_sales_rank.php",
                    method: 'GET',
                    cache: false,
                    data: { product_id: product_id, history: $('.graph-history').val() },
                    success: function(data) {
                        var graphData = jQuery.parseJSON(data);

                        if (graphData.graphData.length > 0) {

                            $('#sales-rank-graph').html('');

                            Morris.Line({
                                resize: true,
                                smooth: false,
                                hideHover: true,
                                element: 'sales-rank-graph',
                                data: graphData.graphData,
                                xkey: 'timestamp',
                                ykeys: ['rank'],
                                labels: ['Rank'],
                                xLabels: 'day',
                                yLabelFormat: function(y) {
                                    if (y % 1 === 0) return -y;
                                    else return "";
                                }
                            });
                        }
                        else {
                            $('#sales-rank-graph').html('<div style="width: 100%; text-align: center; margin-top: 30px">No data available yet.</div>');
                        }
                    }
                });
            }, 500);

        }
    });
}

// Auto Suggest

function show_auto_suggest(message) {

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .auto-suggest-icon').addClass('active');

    $.ajax({
        url: "auto_suggest_list.php",
        method: 'GET',
        cache: false,
        success: function(data) {

            $('.container').html(data);
            draw_alert(message);
            $('.table-main .has-tooltip').tooltip({html: true});
            amz_anonymize();

        }
    });
}

function edit_auto_suggest(auto_suggest_id) {

    $('#autoSuggestModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#autoSuggestModal').modal('show');

    $.ajax({
        url: "auto_suggest.php",
        method: 'GET',
        cache: false,
        data: { auto_suggest_id: auto_suggest_id },
        success: function(data) {
            $('#autoSuggestModal .modal-body').html(data);
        }
    });
}

function save_auto_suggest() {

    if ($('#autoSuggestModal [name=suggest_brand]').val() == '') {
        alert('You need to enter a product brand');
        return;
    }

    if ($('#autoSuggestModal [name=suggest_keyword]').val() == '') {
        alert('You need to enter at least one keyword');
        return;
    }

    $('#autoSuggestModal .btn-save-auto-suggest').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...').attr('disabled', 'disabled');

    $.ajax({
        url: "auto_suggest_save.php",
        method: 'POST',
        cache: false,
        data: $('#autoSuggestModal form').serialize(),
        success: function(data) {
            $('#autoSuggestModal .btn-save-auto-suggest').html('Save Auto Suggest').removeAttr('disabled');
            show_auto_suggest('Auto Suggest Saved');
            $('#autoSuggestModal').modal('hide');
        }
    });
}

function delete_auto_suggest(auto_suggest_id) {
    var auto_suggest_name = $('.auto_suggest_' + auto_suggest_id).html();

    $('#deleteModal input[name=delete_id]').val(auto_suggest_id);
    $('#deleteModal input[name=delete_table]').val('tbl_auto_suggest');
    $('#deleteModal .delete-name').html(auto_suggest_name);
    $('#deleteModal').modal('show');
}


// Inventory

function show_inventory(product_id, variation) {

    $('#inventoryModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#inventoryModal').modal('show');

    $.ajax({
        url: "inventory_modal.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id, variation: variation },
        success: function(data) {
            $('#inventoryModal .modal-body').html(data);

            if (data.indexOf('inventory-graph') > -1) {
                refresh_inventory_graph(product_id);
            }
        }
    });
}

function show_inventory_variations(product_id) {

    var tr = $('#tr_product_' + product_id);
    var row = $('#tr_product_' + product_id).closest('table').dataTable().api().row(tr);


    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down')
    }
    else {
        // Open this row
        row.child( "<div id='inventory_variations_" + product_id + "'><i class='fa fa-spin fa-spinner'></i> Please Wait...</div>" ).show();
        tr.addClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');


        var history = 14;
        if ($('.inventory-history').length) history = $('.inventory-history').val();

        $.ajax({
            url: "inventory-variations-table.php",
            method: 'POST',
            cache: false,
            data: { product_id: product_id, history: history },
            success: function(data) {
                $('#inventory_variations_' + product_id).html(data);
                $('#inventory_variations_table_' + product_id).DataTable({
                    "language": {
                        "zeroRecords": "There is currently no data for this product. Won't be long!"
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "columnDefs": [
                        {"visible": false, "targets": [ 8, 9, 10, 11 ]},
                        {
                            "targets": [0],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = "";
                                    if (row[0] != '') display += '<span class="glyphicon glyphicon-exclamation-sign has-tooltip" title="WARNING: ' + row[0] + '" style="color: #F35958; font-size: 15px; top: 4px; margin: 0 10px 0 0;"></span>';

                                    return display;
                                }
                                else return row[0];
                            }


                        },
                        {
                            "targets": [1],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = "<a href='http://" + row[11] + "/dp/" + row[10] + "' target='_blank'>" + row[1] + "</a>";

                                    display += '<div style="color:#999; font-size:10px;">' + row[10] + '</div>';


                                    return display;
                                }
                                else return row[1];
                            }
                        },
                        {
                            "targets": [2],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = row[9] + row[2];

                                    display += '<div style="color:#999; font-size:10px">' + row[8] + '</div>';


                                    return display;
                                }
                                else return row[2];
                            }
                        },
                        {
                            "targets": [3],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = row[3];

                                    display += '<div style="color:#999; font-size:10px">Total</div>';


                                    return display;
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [4],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = row[9] + row[4];

                                    display += '<div style="color:#999; font-size:10px">' + row[8] + '</div>';


                                    return display;
                                }
                                else return row[4];
                            }
                        },
                        {
                            "targets": [5],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = row[5];

                                    display += '<div style="color:#999; font-size:10px">Per Day</div>';


                                    return display;
                                }
                                else return row[5];
                            }
                        },
                        {
                            "targets": [6],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = row[9] + row[6];

                                    display += '<div style="color:#999; font-size:10px">' + row[8] + '</div>';


                                    return display;
                                }
                                else return row[6];
                            }
                        },

                    ]
                });

                $('#inventory_variations_table_' + product_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();
                $('#inventory_variations_' + product_id).parent().css({ 'padding' : 0, 'height' : 0 }).attr('style', 'background-color: #CBD0D3; padding:0; heaight: 0;');


            }
        });
    }

}

function update_inventory_tracking(product_id, track) {
    $('#inventoryModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#inventoryModal .modal-footer .btn-inventory-toggle').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');

    $.ajax({
        url: "inventory_update.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id, track: track },
        success: function(data) {
            refresh_table(data);


            $.ajax({
                url: "inventory_modal.php",
                method: 'POST',
                cache: false,
                data: { product_id: product_id },
                success: function(data) {
                    $('#inventoryModal .modal-body').html(data);
                }
            });

        }
    });
}

function refresh_inventory_graph(product_id) {

    $.ajax({
        url: "graph_inventory.php",
        method: 'GET',
        cache: false,
        data: { product_id: product_id, variation: $('#inventory-variation').val() },
        success: function(data) {

            var graphData = jQuery.parseJSON(data);

            if (graphData.graphData.length > 0) {

                $('#inventory-graph').html('');

                Morris.Bar({
                    resize: true,
                    smooth: false,
                    hideHover: true,
                    element: 'inventory-graph',
                    data: graphData.graphData,
                    xkey: 'timestamp',
                    ykeys: ['sold', 'inventory'],
                    labels: ['Units Sold', 'Inventory'],
                    xLabels: 'day',
                    yLabelFormat: function(y){return y != Math.round(y)?'':y;}
                });
            }
            else {
                $('#inventory-graph').html('<div style="width: 100%; text-align: center; margin-top: 30px">No data available yet.</div>');
            }
        }
    });
}

function show_sales(message) {

    current_table = "sales";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .sales-icon').addClass('active');

    show_sales_table(message);
}

function change_sales_history() {

    current_table = "sales";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.inner-container').html('<div style="padding-top:140px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div>');

    show_sales_table('');
}

function show_sales_table(message) {

    var history = 14;
    if ($('.inventory-history').length) history = $('.inventory-history').val();


    $.ajax({
        url: "inventory-table.php",
        method: 'POST',
        data: { history: history },
        cache: false,
        success: function(data) {
            $('.container').html(data);

            if (data == '') {
                $('#addProductsModal .close').hide();
                $('#addProductsModal .btn-default').hide();
                // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
                $('#addProductsModal').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
            else {
                $('#addProductsModal .close').show();
                $('#addProductsModal .btn-default').show();

                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [ 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 8px;" onclick="show_inventory_graph(' + row[8] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row[13] == 0) display += ' fav-off ';
                                    if (row[13] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row[8] + '" onclick="toggle_product_favorite(' + row[8] + ', 13)" style="padding-bottom: 6px;"></span>';

                                    if (row[11] != '') display += '<span class="glyphicon glyphicon-exclamation-sign has-tooltip" title="WARNING: ' + row[11] + '" style="color: #F35958; padding-bottom: 22px;"></span>';

                                    display += "</div>";

                                    if (row[16] != '') display += '<img src="' + row[16] + '" class="product-image" onclick="show_inventory_graph(' + row[8] + ')">';


                                    return display;
                                }
                                else return 1-row[13];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display")  {
                                    var display = '<p class="product_name_' + row[8] + '">' + row[1] + '</p><p class="asin"><img src="images/flags/' + row[12] + '.png" style="margin-right: 10px;">' + row[14];

                                    if (row[10] != "") display += " / " + row[10] + "</p>";
                                    if (row[17] != "") display += "<p class='asin'>Sales Rank: " + row[17] + "</p>";
                                    return display;
                                }
                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[15] + row[2] + '<div style="color:#999; font-size:10px">' + row[9] + '</div>';
                                }
                                else return row[2];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") return row[3] + '<div style="color:#999; font-size:10px">Total</div>';
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[15] + row[4] + '<div style="color:#999; font-size:10px">' + row[9] + '</div>';
                                }
                                else return row[4];
                            }
                        },
                        {
                            "targets": [ 5 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") return row[5] + '<div style="color:#999; font-size:10px">Per Day</div>';
                                else return row[5];
                            }
                        },
                        {
                            "targets": [ 6 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[15] + row[6] + '<div style="color:#999; font-size:10px">' + row[9] + '</div>';
                                }
                                else return row[6];
                            }
                        }
                    ],
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();

                draw_alert(message);
            }
        }
    });
}

function show_inventory_graph(product_id) {

    var tr = $('#tr_product_' + product_id);
    var row = $('#tr_product_' + product_id).closest('table').dataTable().api().row(tr);


    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down')
    }
    else {
        // Open this row
        row.child( "<div id='inventory_graph_" + product_id + "'><i class='fa fa-spin fa-spinner'></i> Please Wait...</div>" ).show();
        tr.addClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

        $('#inventory_graph_' + product_id).parent().attr('style', 'background-color: #fff !important;');

        var history = 14;
        if ($('.inventory-history').length) history = $('.inventory-history').val();

        $.ajax({
            url: "graph_inventory.php",
            method: 'GET',
            cache: false,
            data: { product_id: product_id, history: history },
            success: function(data) {

                var graphData = jQuery.parseJSON(data);

                if ($('#show-inventory-on-graphs').is(':checked')) {
                    var ykeys = ['sold', 'inventory'];
                    var labels = ['Units Sold', 'Inventory'];
                }
                else {
                    var ykeys = ['sold'];
                    var labels = ['Units Sold'];
                }

                if (graphData.graphData.length > 0) {

                    $('#inventory_graph_' + product_id).html('');

                    Morris.Bar({
                        resize: true,
                        hideHover: true,
                        element: 'inventory_graph_' + product_id,
                        data: graphData.graphData,
                        xkey: 'timestamp',
                        ykeys: ykeys,
                        labels: labels,
                        xLabels: 'day',
                        yLabelFormat: function(y){ return y != Math.round(y)?'':y;},
                        hoverCallback: function (index, options, content, row) {

                            var hover = '<div class="morris-hover-row-label">' + row[options.xkey] + '</div>';
                            var concat = row[options.xkey];

                            jQuery.each(options.ykeys, function(y) {
                                hover += '<div class="morris-hover-point" style="color:' + options.barColors[y] + '">' + options.labels[y] + ': ' + row[options.ykeys[y]] + '</div>';
                                concat += '<br>' + options.labels[y] + ': ' + row[options.ykeys[y]];

                            });

                            hover += '<div style="text-decoration: underline; cursor: pointer;" onclick="delete_inventory(\'' + row.inventory_ids + '\', \'' + concat + '\')">Delete Day</div>';

                            if (row['sold'] == null) return '<div class="morris-hover-row-label">' + row[options.xkey] + '</div>Deleted';

                            return hover;
                        }
                    });
                }
                else {
                    row.child.hide();
                    tr.removeClass('shown');
                    $(tr).find('td.td-chevron .glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down')
                    draw_alert('No data available for this product yet. Please check back in 24hrs.');
                }
            }
        });

    }
}

function delete_inventory(inventory_ids, desc) {
    $('#deleteInventoryModal .delete-inventory-details').html(desc);
    $('#deleteInventoryModal input[name=inventory_ids]').val(inventory_ids);
    $('#deleteInventoryModal').modal('show');
}

function delete_inventory_confirm() {
    var inventory_ids = $('#deleteInventoryModal input[name=inventory_ids]').val().split(',');

    $('#deleteInventoryModal .modal-footer .btn-danger').html('<i class="fa fa-spin fa-spinner"></i> Please Wait').attr('disabled', 'disabled');

    $.ajax({
        url: "delete.php",
        method: 'POST',
        cache: false,
        data: { id: inventory_ids, table: 'tbl_inventory' },
        success: function(data) {
            $('#deleteInventoryModal .modal-footer .btn-danger').html('Delete').removeAttr('disabled');

            draw_alert("Sales/Inventory deleted");

            if (data != '') {
                show_inventory_graph(data);
                show_inventory_graph(data);
            }

            $('#deleteInventoryModal').modal('hide');
        }
    });

}



function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

function draw_mini_graph(keyword_id) {


    $('#mini_graph_' + keyword_id).html("<i class='fa fa-spin fa-spinner'></i>");

    $.ajax({
        url: "graph_data.php",
        method: 'GET',
        cache: false,
        data: { keyword_id: keyword_id, history: 'weekly' },
        success: function(data) {

            var graphData = jQuery.parseJSON(data);

            if (graphData.graphData.length > 0) {

                $('#mini_graph_' + keyword_id).html('');

                Morris.Line({
                    resize: true,
                    smooth: false,
                    axes: false,
                    grid: false,
                    hideHover: 'always',
                    lineWidth: 1,
                    pointSize: 2,
                    element: 'mini_graph_' + keyword_id,
                    data: graphData.graphData,
                    xkey: 'timestamp',
                    ykeys: ['rank'],
                    labels: ['Rank'],
                    xLabels: 'day',
                    yLabelFormat: function(y) {
                        if (y % 1 === 0) return -y;
                        else return "";
                    }
                });
            }
            else {
                $('#mini_graph_' + keyword_id).html('');
            }


        }
    });
}

// Edit Product

function edit_product(product_id) {
    edit_product_redirection(product_id, 0);
}

function edit_product_redirection(product_id, tab_redirection) {

    $('#editProductModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#editProductModal .modal-footer .btn').prop('disabled', true);
    $('#editProductModal').modal('show');

    $.ajax({
        url: "edit_product_modal.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id, tab_redirection: tab_redirection },
        success: function(data) {
            $('#editProductModal .modal-body').html(data);
            $('#editProductModal .modal-footer .btn').prop('disabled', false);

            redirection_edit_table_old = $('.redirection-edit-table').html();
        }
    });
}


// Edit Job

function edit_job(product_id,type) {

    edit_job_redirection(product_id, 0,"product_id");
}
function edit_job_post(product_id,type) {

    edit_job_redirection(product_id, 0,"post_id");
}
function edit_job_redirection(product_id, tab_redirection,type) {
    /*tab_redirection干嘛的？*/
   
    $('#editJobModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#editJobModal .modal-footer .btn').prop('disabled', true);
    $('#editJobModal').modal('show');

    $.ajax({
        url: "edit_job_modal.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id, tab_redirection: tab_redirection ,type:type},
        success: function(data) {

            $('#editJobModal .modal-body').html(data);
            $('#editJobModal .modal-footer .btn').prop('disabled', false);

            redirection_edit_table_old = $('.redirection-edit-table').html();
        }
    });
}
function validate_slug(td) {
    var slug = $(td).html();

    slug = JSON.stringify(slug).replace(/\W/g, '')

    $(td).html(slug);
}


function remove_redirection_row(e) {
    e.parent().parent().remove();
}

function undo_redirection_changes() {
    $('.redirection-edit-table').html(redirection_edit_table_old);
}

function serialize_redirection_table() {

    var rows = Array();

    $('.redirection-edit-table tbody tr').each(function() {
        var row = Array(
            $(this).data('id'),
            $(this).children(':nth(0)').children().html(),
            $(this).children(':nth(1)').children().html(),
            $(this).children(':nth(2)').children().html()
        );

        rows.push(row);
    });

    return rows;
}

// Bulk Operations

function rankings_toggle_check(keyword_id, mouse_over) {
    if ($('#check_rankings_keyword_' + keyword_id).is(':checked')) {
        $('#tr_keyword_' + keyword_id + ' .keyword_flag').hide();
        $('#tr_keyword_' + keyword_id + ' .rankings_checkbox').show();
    }
    else {
        if (mouse_over) {
            $('#tr_keyword_' + keyword_id + ' .keyword_flag').hide();
            $('#tr_keyword_' + keyword_id + ' .rankings_checkbox').show();
        }
        else {
            $('#tr_keyword_' + keyword_id + ' .keyword_flag').show();
            $('#tr_keyword_' + keyword_id + ' .rankings_checkbox').hide();
        }
    }

    show_bulk_operations();
}

function rankings_check_all(product_id) {
    var checked_all = $('#check_rankings_all_' + product_id).is(':checked');

    $('#table_product_' + product_id + ' tbody input[type=checkbox]').prop('checked', checked_all);

    if (checked_all) {
        $('#table_product_' + product_id + ' .keyword_flag').hide();
        $('#table_product_' + product_id + ' .rankings_checkbox').show();
    }
    else {
        $('#table_product_' + product_id + ' .keyword_flag').show();
        $('#table_product_' + product_id + ' .rankings_checkbox').hide();
    }

    show_bulk_operations();
}

function show_bulk_operations() {
    var show_bulk = false;

    $('.table-main .rankings_checkbox>input[type=checkbox]:checked').each(function() {
        show_bulk = true;
    });

    if (show_bulk) {
        $('.table-main-menu').hide();
        $('.bulk-menu').show();
        $('.alert-suggestions').hide();
    }
    else {
        $('.table-main-menu').show();
        $('.bulk-menu').hide();
    }
}

function bulk_select() {
    var bulk_select = $('.bulk-select').val();

    if (bulk_select == '') return;

    if (bulk_select == 'select-all') {
        $('.table-main .keyword_flag').hide();
        $('.table-main .rankings_checkbox').show();
        $('.table-main .rankings_checkbox>input[type=checkbox]').prop('checked', true);
    }

    if (bulk_select == 'select-none') {
        $('.table-main .keyword_flag').show();
        $('.table-main .rankings_checkbox').hide();
        $('.table-main .rankings_checkbox>input[type=checkbox]').prop('checked', false);
    }

    if (bulk_select == 'select-non-ranking') {
        $('.table-main .keyword_flag').hide();
        $('.table-main .rankings_checkbox').show();
        $('.table-main .rankings_checkbox>input[type=checkbox].non-ranking').prop('checked', true);
        $('.table-main .rankings_checkbox>input[type=checkbox].is-ranking').prop('checked', false);
    }

    if (bulk_select == 'select-ranked') {
        $('.table-main .keyword_flag').hide();
        $('.table-main .rankings_checkbox').show();
        $('.table-main .rankings_checkbox>input[type=checkbox].non-ranking').prop('checked', false);
        $('.table-main .rankings_checkbox>input[type=checkbox].is-ranking').prop('checked', true);
    }
}

function bulk_delete_keywords() {
    var delete_keyword_count = 0;

    $('.table-main .rankings_checkbox>input[type=checkbox]:checked').each(function() {
        delete_keyword_count++;
    });

    $('#bulkDeleteModal .delete-name').html('<strong>' + delete_keyword_count + ' keywords will be deleted</strong>');

    $('#bulkDeleteModal').modal('show');
}

function get_checked_keyword_ids() {

    var keyword_ids = Array();

    $('.table-main .rankings_checkbox>input[type=checkbox]:checked').each(function() {
        keyword_ids.push($(this).data('keyword_id'));
    });

    return keyword_ids;

}

function bulk_delete_keywords_complete() {
    $('#bulkDeleteModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#bulkDeleteModal .modal-footer .btn-danger').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    var keyword_ids = get_checked_keyword_ids();

    $.ajax({
        url: "bulk_delete_keywords.php",
        method: 'POST',
        cache: false,
        data: { keyword_ids: keyword_ids },
        success: function(data) {
            $('#bulkDeleteModal .modal-footer .btn').removeAttr('disabled');
            $('#bulkDeleteModal .modal-footer .btn-danger').html('Delete');
            $('#bulkDeleteModal').modal('hide');

            refresh_table(data);
        }
    });
}

function bulk_export() {
    $('#bulkExportModal .input-datepicker').datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true,
        orientation: "top auto"
    }).on('changeDate', function (ev) {

        if ($('#bulkExportModal input[name=start_date]').val().split("-").reverse().join("-") > $('#bulkExportModal input[name=end_date]').val().split("-").reverse().join("-")) {
            if ($(this).attr('name') == 'start_date') $('#bulkExportModal input[name=end_date]').val($('#bulkExportModal input[name=start_date]').val()).data('date', $('#bulkExportModal input[name=start_date]').val()).datepicker('update');
            else $('#bulkExportModal input[name=start_date]').val($('#bulkExportModal input[name=end_date]').val()).data('date', $('#bulkExportModal input[name=end_date]').val()).datepicker('update');
        }

    });

    $('#bulkExportModal').modal('show');
}

function bulk_export_complete() {

    var keyword_ids = get_checked_keyword_ids();

    $('#bulkExportModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#bulkExportModal .modal-footer .btn-success').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "bulk_export.php",
        method: 'POST',
        cache: false,
        data: { keyword_ids: keyword_ids, start_date: $('#bulkExportModal input[name=start_date]').val(), end_date: $('#bulkExportModal input[name=end_date]').val() },
        success: function(data) {
            if (data == '') {
                draw_alert("No data exists for the dates and keywords selected.");
            }
            else {
                var fileName = "amztracker";
                function msieversion() {
                    var ua = window.navigator.userAgent;
                    var msie = ua.indexOf("MSIE ");
                    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
                        return true;
                    } else {
                        return false;
                    }
                    return false;
                }
                if(msieversion()){
                    var IEwindow = window.open();
                    IEwindow.document.write('sep=,\r\n' + data);
                    IEwindow.document.close();
                    IEwindow.document.execCommand('SaveAs', true, fileName + ".csv");
                    IEwindow.close();
                } else {
                    var uri = 'data:application/csv;charset=utf-8,' + escape(data);
                    var link = document.createElement("a");
                    link.href = uri;
                    link.style = "visibility:hidden";
                    link.download = fileName + ".csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }


            $('#bulkExportModal .modal-footer .btn').removeAttr('disabled');
            $('#bulkExportModal .modal-footer .btn-success').html('Export');
            $('#bulkExportModal').modal('hide');

        }
    });

}

function bulk_cancel() {

    $('.table-main .keyword_flag').show();
    $('.table-main .rankings_checkbox').hide();
    $('.table-main .rankings_checkbox>input[type=checkbox]').prop('checked', false);


    $('.table-main-menu').show();
    $('.bulk-menu').hide();
}


// Competiiton

function show_comp(keyword_id) {
    $('#competitionModal .modal-body #competition-graph').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#competitionModal .modal-body #competition-table').html('');
    $('#competitionModal').modal('show');

    $.ajax({
        url: "graph_competition.php",
        method: 'GET',
        cache: false,
        data: { keyword_id: keyword_id },
        success: function(data) {

            var graphData = jQuery.parseJSON(data);

            if (graphData.graphData.length > 0) {

                $('#competition-graph').html('');

                compMorris = Morris.Line({
                    resize: true,
                    smooth: false,
                    hideHover: true,
                    grid: false,
                    element: 'competition-graph',
                    data: graphData.graphData,
                    xkey: 'timestamp',
                    ykeys: graphData.yData,
                    labels: graphData.labels,
                    lineColors: graphData.colours,
                    xLabels: 'day',
                    ymax: -1,
                    yLabelFormat: function(y) {
                        if (y % 1 === 0) return -y;
                        else return "";
                    }
                });

                $('#competition-table').append('<table><thead><tr>' +
                    '<th>' +
                    '<div class="checkbox check-white" style="margin: 0;">' +
                    '<input id="check_asinall" type="checkbox" onclick="update_competition_all()" checked>' +
                    '<label for="check_asinall"></label></div>' +
                    '</th>' +
                    '<th>ASIN</th></tr></thead><tbody></tbody></table>');

                jQuery.each(graphData.yData, function(e) {
                    var asin = graphData.yData[e];
                    var colour = graphData.colours[e];

                    var tr = '<div class="checkbox check-white" style="margin: 0;">' +
                        '<input id="check_asin_' + asin + '" data-color="' + colour +'" type="checkbox" onclick="update_competition(\'' + asin +'\', \'' + colour +'\')" checked>' +
                        '<label for="check_asin_' + asin + '"></label></div>';

                    $('#competition-table table>tbody').append('<tr><td>' + tr + '</td><td style="color: ' + colour + '"><div class="asin-colour" style="background-color: ' + colour + '"></div>' + graphData.labels[e] + '</td></tr>');
                });
            }
            else {
                $('#competition-graph').html('<div style="width: 100%; text-align: center; margin-top: 30px">No data available yet.</div>');
            }
        }
    });
}

function update_competition(asin, colour) {
    var isChecked = $('#competitionModal #check_asin_' + asin).is(':checked');
    colour = colour.toLowerCase();

    if (isChecked) {
        $('#competition-graph path[stroke=' + colour + ']').show();
        $('#competition-graph circle[fill=' + colour + ']').show();
    }
    else {
        $('#competition-graph path[stroke=' + colour + ']').hide();
        $('#competition-graph circle[fill=' + colour + ']').hide();
    }
}

function update_competition_all() {
    var isChecked = $('#competitionModal #check_asinall').is(':checked');

    jQuery.each($('input[id^=check_asin_]'), function() {
        var colour = $(this).data('color').toLowerCase();

        if (isChecked) {
            $('#competition-graph path[stroke=' + colour + ']').show();
            $('#competition-graph circle[fill=' + colour + ']').show();
            $(this).prop('checked', true);
        }
        else {
            $('#competition-graph path[stroke=' + colour + ']').hide();
            $('#competition-graph circle[fill=' + colour + ']').hide();
            $(this).prop('checked', false);
        }
    });

}


// Reviews

function show_reviews(message) {

    current_table = "reviews";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .reviews-icon').addClass('active');


    $.ajax({
        url: "reviews-table.php",
        method: 'GET',
        cache: false,
        success: function(data) {

            if (data == "0") {
                refresh_rank_table('<p>You have not marked any products for review tracking. To do this click on the <span class="glyphicon glyphicon-heart" style="margin-right: 7px;"></span> for the products you wish to track.</p>');
                return;
            }
            else if (data == "-1") {
                refresh_rank_table('<p>There are no low rating reviews for your products yet. Please check back later.</p>');
                return;
            }

            $('.container').html(data);

            if (data != '') {
                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [ 6, 7 ] },
                        {
                            "targets": [ 0 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '<div class="checkbox check-white" style="margin: 0;">' +
                                        '<input id="check_review_' + row[7] + '" type="checkbox" onclick="review_check(' + row[7] + ')" ';
                                    if (row[0] == 1) display += 'checked';

                                    display += '><label for="check_review_' + row[7] + '"></label></div>';
                                    return display;
                                }
                                else return row[0];
                            }
                        },

                        {
                            "targets": [ 3 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = "";

                                    for (var i = 0; i < row[3]; i++) {
                                        display += "<span class='glyphicon glyphicon-star' style='margin-left:0'></span>";
                                    }
                                    return display;
                                }
                                else return row[3];
                            }
                        }
                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();
                show_all_reviews();

                draw_alert(message);
            }
        }
    });
}

function review_check(review_id) {
    $('tr#tr_review_' + review_id +' td:first-child').html('<i class="fa fa-spin fa-spinner"></i>');

    $.ajax({
        url: "review_check.php",
        method: 'POST',
        cache: false,
        data: { review_id: review_id },
        success: function(data) {

            var innerhtml = '<div class="checkbox check-white" style="margin: 0;">' +
                '<input id="check_review_' + review_id + '" type="checkbox" onclick="review_check(' + review_id + ')" ';

            if (data == 1) innerhtml += 'checked';

            innerhtml += '><label for="check_review_' + review_id +'"></label></div>';

            $('tr#tr_review_' + review_id +' td:first-child').html(innerhtml);

            var tr = $('#tr_review_' + review_id);
            var row = dTable.row(tr);
            var d = row.data();

            d[0] = data;

            row.data(d);


            update_review_count();

        }
    });
}

function review_toggle(product_id) {

    $('#tr_product_' + product_id + ' .glyphicon-heart').removeClass('glyphicon glyphicon-heart').addClass('fa fa-spin fa-spinner');


    $.ajax({
        url: "review_check.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id },
        success: function(data) {

            $('#tr_product_' + product_id + ' .fa.fa-spin.fa-spinner').addClass('glyphicon glyphicon-heart').removeClass('fa fa-spin fa-spinner');

            if (data == 1) $('#tr_product_' + product_id + ' .glyphicon-heart').attr('style', 'color: #ff6666; margin-left: 7px;');
            if (data == 0) $('#tr_product_' + product_id + ' .glyphicon-heart').attr('style', 'margin-left: 7px;');

            if ((data != 1) && (data != 0)) draw_alert(data);

        }
    });
}

function review_check_all() {

    var review_ids = Array();
    var checked = true;

    $('.table-reviews tbody>tr').each(function() {
        review_ids.push($(this).data('review_id'));
    });

    $('.table-reviews tbody>tr>td:first-child').html('<i class="fa fa-spin fa-spinner"></i>');


    $.ajax({
        url: "review_check.php",
        method: 'POST',
        cache: false,
        data: { review_ids: review_ids, checked: checked },
        success: function(data) {

            if ((data != 1) && (data != 0)) {
                draw_alert(data);
                return;
            }

            // jQuery.each(review_ids, function(index) {

            //     var innerhtml = '<div class="checkbox check-white" style="margin: 0;">' +
            //         '<input id="check_review_' + review_ids[index] + '" type="checkbox" onclick="review_check(' + review_ids[index] + ')" ';

            //     if (data == 1) innerhtml += 'checked';

            //     innerhtml += '><label for="check_review_' + review_ids[index] +'"></label></div>';

            //     $('tr#tr_review_' + review_ids[index] +' td:first-child').html(innerhtml);

            //     var tr = $('#tr_review_' + review_ids[index]);
            //     var row = dTable.row(tr);
            //     var d = row.data();

            //     d[0] = data;

            //     row.data(d);


            // });

            // update_review_count();

            refresh_table("All reviews checked/hidden");

        }
    });
}


function show_all_reviews() {
    if ($('#show-all-reviews').is(':checked')) dTable.column(0).search('').draw();
    else dTable.column(0).search(0).draw();
}


// Favorites

function toggle_keyword_favorite(keyword_id, product_id) {
    $('.keyword_fav_' + keyword_id).removeClass('glyphicon glyphicon-star fav-on fav-off').addClass('fa fa-spin fa-spinner');

    $.ajax({
        url: "fav_toggle.php",
        method: 'POST',
        cache: false,
        data: { keyword_id: keyword_id },
        success: function(data) {
            if (data == 0) $('.keyword_fav_' + keyword_id).addClass('glyphicon glyphicon-star fav-off').removeClass('fa fa-spin fa-spinner');
            if (data == 1) $('.keyword_fav_' + keyword_id).addClass('glyphicon glyphicon-star fav-on').removeClass('fa fa-spin fa-spinner');

            var tr = $('#tr_keyword_' + keyword_id);
            var row = $('#table_product_' + product_id).DataTable().row(tr);
            var d = row.data();

            d[1] = data;

            row.data(d);
        }
    });
}


function toggle_product_favorite(product_id, dtable_col) {
    $('.product_fav_' + product_id).removeClass('glyphicon glyphicon-star fav-on fav-off').addClass('fa fa-spin fa-spinner');

    $.ajax({
        url: "fav_toggle.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id },
        success: function(data) {
            if (data == 0) $('.product_fav_' + product_id).addClass('glyphicon glyphicon-star fav-off').removeClass('fa fa-spin fa-spinner');
            if (data == 1) $('.product_fav_' + product_id).addClass('glyphicon glyphicon-star fav-on').removeClass('fa fa-spin fa-spinner');

            var tr = $('#tr_product_' + product_id);
            var row = dTable.row( tr );
            var d = row.data();

            d[dtable_col] = data;

            row.data(d);
        }
    });
}


// IQ

function show_iq(message) {

    current_table = "iq";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .iq-icon').addClass('active');


    $.ajax({
        url: "iq-table.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('.container').html(data);

            if (data == '') {
                $('#addProductsModal .close').hide();
                $('#addProductsModal .btn-default').hide();
                // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
                $('#addProductsModal').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
            else {
                $('#addProductsModal .close').show();
                $('#addProductsModal .btn-default').show();

                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [ 6, 7, 8, 9 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-flag",
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-fav",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[1] == 1) return "<span class='glyphicon glyphicon-star iq_fav_" + row[6] + " fav-on has-tooltip' title='Click to toggle favorite' onclick='toggle_iq_favorite(" + row[6] + ")'></span>";
                                    if (row[1] == 0) return "<span class='glyphicon glyphicon-star iq_fav_" + row[6] + " fav-off has-tooltip' title='Click to toggle favorite' onclick='toggle_iq_favorite(" + row[6] + ")'></span>";
                                }
                                else {
                                    return row[1];
                                }
                            }

                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[2] != '') var display = '<p style="margin: 10px 0 2px 0;">' + row[2] + '</p><div style="color:#999; font-size:10px"><img src="images/flags/' + row[9] + '.png" style="margin-right: 10px;">' + row[8];
                                    else var display = '<p stule="margin: 10px 0 2px 0;"><span class="glyphicon glyphicon-time" style="cursor: default; margin-left: 0;"></span> Analyzing product. Won\'t be long!</p><div style="color:#999; font-size:10px"><img src="images/flags/' + row[9] + '.png" style="margin-right: 10px;">' + row[8];

                                    if (row[7] != '') display += ' / ' + row[7];

                                    return display + '</div>';
                                }
                                else return row[2];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "td-ticks",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = "";

                                    for (var i = 0; i < row[3]; i++) {
                                        display += '<span class="glyphicon glyphicon-ok" style="color: #27ae60"></span>';
                                    }
                                    return display;
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    if (row[4] == "") return '<span class="glyphicon glyphicon-time has-tooltip" style="cursor: default;" title="Product is still being analyzed. Won\'t be long!"></span>';
                                    else return row[4];
                                }
                                else return row[4];
                            }
                        }
                    ],
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();

                draw_alert(message);
            }
        }
    });
}

function show_iq_metrics(iq_id) {

    var tr = $('#tr_iq_' + iq_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {

        // This row is already open - close it
        $('#table_iq_' + iq_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');
    }
    else {
        // Open this row

        row.child('<i class="fa fa-spin fa-spinner"></i> Please Wait...').show();
        $(tr).find('td .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

        $.ajax({
            url: "iq_metrics.php",
            method: 'GET',
            cache: false,
            data: { id: iq_id },
            success: function(data) {
                row.child( data ).show();

                tr.addClass('shown');

                $('#table_iq_keywords_' + iq_id).parent().css({ 'padding' : 0, 'height' : 0 }).attr('style', 'background-color: #CBD0D3;');
                $('.has-tooltip').tooltip({html: true});
                amz_anonymize();
            }
        });
    }
}

function add_iq_products_modal() {
    $('#addIQModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#addIQModal').modal('show');

    $.ajax({
        url: "iq_add_modal.php",
        method: 'POST',
        cache: false,
        success: function(data) {
            $('#addIQModal .modal-body').html(data);
        }
    });
}

function iq_current_product() {
    var product_id = $('#addIQModal select[name=iq-current-product]').val();

    $.ajax({
        url: "iq_add_modal.php",
        method: 'POST',
        data: { product_id: product_id },
        cache: false,
        success: function(data) {
            $('#addIQModal .modal-body').html(data);
        }
    });
}

function add_iq_products() {
    if ($('#addIQModal textarea[name=asins]').val() == '') {
        alert('You must type in an ASIN or URL of a product.');
        return;
    }

    $('#addIQModal .modal-footer .btn').prop('disabled', true);
    $('#addIQModal .modal-footer .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "iq_add_products.php",
        method: 'POST',
        cache: false,
        data: $('#addIQModal form').serialize(),
        success: function(data) {
            $('#addIQModal .modal-footer .btn').prop('disabled', false);
            $('#addIQModal .modal-footer .btn-primary').html('Add Product');

            refresh_table(data);

            $('#addIQModal').modal('hide');
        }
    });
}

function toggle_iq_favorite(iq_id) {
    $('.iq_fav_' + iq_id).removeClass('glyphicon glyphicon-star fav-on fav-off').addClass('fa fa-spin fa-spinner');

    $.ajax({
        url: "fav_toggle.php",
        method: 'POST',
        cache: false,
        data: { iq_id: iq_id },
        success: function(data) {
            if (data == 0) $('.iq_fav_' + iq_id).addClass('glyphicon glyphicon-star fav-off').removeClass('fa fa-spin fa-spinner');
            if (data == 1) $('.iq_fav_' + iq_id).addClass('glyphicon glyphicon-star fav-on').removeClass('fa fa-spin fa-spinner');

            var tr = $('#tr_iq_' + iq_id);
            var row = dTable.row(tr);
            var d = row.data();

            d[1] = data;

            row.data(d);
        }
    });
}

function iq_show_bulk_operations() {
    var show_bulk = false;

    $('.table-main input[type=checkbox]:checked').each(function() {
        show_bulk = true;
    });

    if (show_bulk) $('.bulk-menu').show();
    else $('.bulk-menu').hide();

}

function iq_check_all(product_id) {
    var checked_all = $('#check_iq_all').is(':checked');

    $('.table-main input').prop('checked', checked_all);

    iq_show_bulk_operations();
}

function bulk_delete_iq() {
    var delete_iq_count = 0;

    $('.table-main tbody input[type=checkbox]:checked').each(function() {
        delete_iq_count++;
    });

    $('#bulkDeleteIQModal .delete-name').html('<strong>' + delete_iq_count + ' products will be deleted</strong>');

    $('#bulkDeleteIQModal').modal('show');
}

function get_checked_iq_ids() {

    var iq_ids = Array();

    $('.table-main tbody input[type=checkbox]:checked').each(function() {
        iq_ids.push($(this).data('iq_id'));
    });

    return iq_ids;

}

function bulk_delete_iq_complete() {
    $('#bulkDeleteIQModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#bulkDeleteIQModal .modal-footer .btn-danger').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    var iq_ids = get_checked_iq_ids();

    $.ajax({
        url: "delete.php",
        method: 'POST',
        cache: false,
        data: { id: iq_ids, table: 'tbl_iqs' },
        success: function(data) {
            $('#bulkDeleteIQModal .modal-footer .btn').removeAttr('disabled');
            $('#bulkDeleteIQModal .modal-footer .btn-danger').html('Delete');
            $('#bulkDeleteIQModal').modal('hide');

            refresh_table(data);
        }
    });
}

function bulk_refresh_iq() {
    $('.btn-bulk-refresh').attr('disabled', 'disabled').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    var iq_ids = get_checked_iq_ids();

    jQuery.each(iq_ids, function(index) {
        $('#tr_iq_' + iq_ids[index] + ' .refresh').html('<i class="fa fa-spin fa-spinner"></i>');
    });

    refresh_iq_call(iq_ids);
}

function refresh_iq(iq_id) {
    $('#tr_iq_' + iq_id + ' .refresh').html('<i class="fa fa-spin fa-spinner"></i>');

    var iq_ids = Array();
    iq_ids.push(iq_id);

    refresh_iq_call(iq_ids);
}

function refresh_iq_call(iq_ids) {
    $.ajax({
        url: "iq_refresh.php",
        method: 'POST',
        cache: false,
        data: { iq_ids: iq_ids },
        success: function(data) {
            $('.btn-bulk-refresh').removeAttr('disabled').html('<span class="glyphicon glyphicon-refresh"></span> Refresh Products</button>');

            jQuery.each(iq_ids, function(index) {
                var iq_id = iq_ids[index];

                var tr = $('#tr_iq_' + iq_id);
                var row = dTable.row(tr);
                var d = row.data();

                d[4] = "";

                row.data(d);

                $('#tr_iq_' + iq_id + ' .refresh').hide();

                $.ajax({
                    url: "force_update_analyzer.php",
                    method: 'POST',
                    cache: false,
                    data: { iq_id: iq_id },
                    success: function(data) {
                    }
                });
            });
        }
    });
}


function edit_iq_modal(iq_id) {
    $('#editIQModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#editIQModal').modal('show');

    $.ajax({
        url: "iq_edit_modal.php",
        method: 'POST',
        data: { iq_id: iq_id },
        cache: false,
        success: function(data) {
            $('#editIQModal .modal-body').html(data);
        }
    });
}

function save_edit_iq_products() {
    $('#editIQModal .modal-footer .btn').attr('disabled', true);
    $('#editIQModal .modal-footer .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "iq_save.php",
        method: 'POST',
        cache: false,
        data: $('#editIQModal form').serialize(),
        success: function(data) {
            $('#editIQModal .modal-footer .btn').removeAttr('disabled');
            $('#editIQModal .modal-footer .btn-primary').html('Save');
            $('#editIQModal').modal('hide');

            refresh_table(data);
        }
    });
}


// Review Trader

function show_review_trader(message) {

    current_table = "review_trader";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .review-trader-icon').addClass('active');


    $.ajax({
        url: "review-trader-table.php",
        method: 'POST',
        cache: false,
        data: { running_only: review_trader_show_running_listings_only },
        success: function(data) {

            $('.container').html(data);

            if (data != '') {
                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "columnDefs": [
                        { "visible": false, "targets": [ 2, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_request_table_new(' + row[8] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row[13] == 0) display += ' fav-off ';
                                    if (row[13] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row[8] + '" onclick="toggle_product_favorite(' + row[8] + ', 13)"></span>';
                                    display += '</div>';

                                    if (row[19] != '') display += '<img src="' + row[19] + '" class="product-image" onclick="show_art(' + row[8] + ')">';

                                    return display;
                                }
                                else return 1-row[13];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<p style="margin: 10px 0 2px 0;">';

                                    display += row[1] + '</p>';

                                    display += '<div style="color:#999; font-size:10px">';
                                    if (row[17] != '') display += '<span class="glyphicon glyphicon-exclamation-sign has-tooltip" title="WARNING: ' + row[17] + '" style="color: #F35958; font-size: 15px; top: 4px; margin: 0 10px 0 0;"></span>';
                                    display += '<img src="images/flags/' + row[12] + '.png" style="margin-right: 10px;">' + row[14];

                                    if (row[11] != '') display += ' / ' + row[11];

                                    return display + '</div>';
                                }
                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[2] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Start date not set'></span>";

                                    return row[2];
                                }
                                else return row[2];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[3] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Expiry date not set'></span>"

                                    return '<div class="has-tooltip" title="Start: ' + row[2] + '" style="cursor: pointer;">' + row[3] + '</div>';
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-price",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[10] + row[4] + '<div style="color:#999; font-size:10px">' + row[9] + '</div>';
                                }
                                else return row[4];
                            }
                        },
                        {
                            "targets": [ 5 ],
                            "class": "td-price",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[5];
                                }
                                else return row[5];
                            }
                        },
                        {
                            "targets": [ 6 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[6] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Voucher not set'></span>"

                                    return row[6];
                                }
                                else return row[6];
                            }
                        },
                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();
                show_running_only()

                draw_alert(message);
            }
        }
    });
}

function show_art(product_id) {
    $('#artModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#artModal').modal('show');

    $.ajax({
        url: "review_trader_modal.php",
        method: 'POST',
        cache: false,
        data: { product_id: product_id },
        success: function(data) {
            $('#artModal .modal-body').html(data);

            $('#artModal .input-datepicker').datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
                orientation: "top auto"
            })
                .on('changeDate', function() {
                    art_check_pause();
                });

            $('#artModal .has-tooltip').tooltip({html: true});
            amz_anonymize();

            update_art_link();
            art_email_preview(1);
            art_check_pause();
        }
    });
}

function art_email_preview(complete) {

    $('#art_variant_note').val($('#art_variant_note').val().substr(0, 60));
    $('#art_shipping_note').val($('#art_shipping_note').val().substr(0, 60));
    $('#art_seller_note').val($('#art_seller_note').val().substr(0, 60));
    $('#art_voucher_note').val($('#art_voucher_note').val().substr(0, 60));

    var art_title = $('#artModal #art_title').val().replace(/\n/gi,'<br>');
    var art_description = $('#artModal #art_description').val().replace(/\n/gi,'<br>');
    var art_support_email = $('#artModal #art_support_email').val();
    var art_price = $('#artModal #art_price').val();

    $('.art-email-preview #product-title').html(art_title);
    $('.art-email-preview #support-email').html(art_support_email);
    $('.art-email-preview #support-email').prop('href', 'mailto:' + art_support_email);

    $('.art-on-site-preview p.title').html(art_title);
    $('.art-on-site-preview .description').html(art_description);
    $('.art-on-site-preview .value').html(art_price);

    $('.art-email-preview').height($('#artModal #art-details').height());
    $('.art-on-site-preview').height($('#artModal #art-details').height());

    if (!complete) return;

    $.ajax({
        url: "art_on_site_preview.php",
        method: 'POST',
        cache: false,
        data: $('#artModal form').serialize(),
        success: function(data) {

            $('.art-on-site-preview').html(data);

        }
    });
}

function update_art_link() {

    var art_link = $('#art_variation').data('prefix') + $('#art_variation').val();

    if ($('#art_merchant_id').val() != '') art_link += '?m=' + $('#art_merchant_id').val();

    $('#art_link_example').html('Link: <a href="' + art_link + '" target="_blank">' + art_link + '</a>');
    $('.art_link_example a').prop('href', art_link);

    art_email_preview(1);
}

function update_art_prices(field) {

    var price = $('#art_price').val();
    var discount = $('#art_discount').val();
    var discount_type = $('#art_discount_type').val();
    var final_price = $('#art_final_price').val();

    if ((!is_numeric(final_price)) && (field == 'final_price')) field = 'price';
    if ((!is_numeric(price)) && (field == 'price')) field = 'final_price';

    if (!is_numeric(price)) price = 0;
    if (!is_numeric(discount)) discount = 0;
    if (!is_numeric(final_price)) final_price = 0;

    price = parseFloat(price).toFixed(2);
    final_price = parseFloat(final_price).toFixed(2);
    discount = parseFloat(discount).toFixed(2);


    if (field == 'price') {
        if (discount_type == "flat") final_price = (price - discount).toFixed(2);
        if (discount_type == "percent") final_price = (price - discount/100*price).toFixed(2);
    }

    if (field == 'final_price') {
        if (discount_type == "flat") discount = (price - final_price).toFixed(2);
        if (discount_type == "percent") {
            if (price == 0) {
                discount = 0;
                final_price = 0;
            }
            else discount = ((price*100 - final_price*100)/price).toFixed(2);
        }
    }

    $('#art_price').val(price);
    $('#art_discount').val(discount);
    $('#art_discount_type').val();
    $('#art_final_price').val(final_price);
}

function is_numeric(obj) {
    return obj - parseFloat(obj) >= 0;
}

function save_review_trader() {

    var display_error = "";

    if ($('#artModal #art_blurb').val() == "") display_error += '- short promotional description\n';
    if ($('#artModal #art_support_email').val() == "") display_error += '- support email\n';
    if ($('#artModal #art_voucher').val() == "") display_error += '- voucher code\n';
    if ($('#artModal #art_price').val() == "") display_error += '- original price\n';
    if ($('#artModal #art_discount').val() == "") display_error += '- discount\n';
    if ($('#artModal #art_final_price').val() == "") display_error += '- final price\n';
    if (!$('#artModal #art_protect').is(':checked')) display_error += '- confirm your inventory is protected\n';
    if ($('#artModal #art_super_url_slug option:selected').text() == "Choose Option...") display_error += '- Super URL\n';
    if ($('#artModal #art_product_group option:selected').text() == "Select product group") display_error += '- Product Group\n';
    if ($('#artModal #art_shipping').val() == "") display_error += '- Est. Shipping\n';

    if (display_error == "- voucher code\n") {
        var r = confirm("You haven't entered any vouchers. Your product will NOT be shown! Are you sure you want to save?");
        if (r != true) {
            return;
        }
    }
    else if (display_error != "") {
        display_error = "You need to fill in/check the following:\r\n" + display_error;
        alert(display_error);
        return;
    }

    if($('#thirty-percent-off-offers').val() >= 800){
        if ($('#art_price').val()*7/10 < $('#art_final_price').val()) {
            alert('Your product must be more than 30% off');
            return;
        }
    }else{
        if ($('#art_price').val()/2 < $('#art_final_price').val()) {
            alert('Your product must be more than 50% off');
            return;
        }
    }

    $('#artModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#artModal .modal-footer .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');

    $.ajax({
        url: "review_trader_save.php",
        method: 'POST',
        cache: false,
        data: $('#artModal form').serialize(),
        success: function(data) {

            $('#artModal .modal-footer .btn').removeAttr('disabled');
            $('#artModal .modal-footer .btn-primary').html('Save');

            $('#artModal').modal('hide');

            refresh_table(data);
            $.ajax({
                url: "review-trader-table.php?mode=showActiveProducts",
                method: 'GET',
                cache: false,
                success: function(data) {
                    $("#live-product-count").html(data);
                }
            });

        }
    });
}

function show_running_only() {
    console.log($('#show-running-only').is(':checked'));
    dTable.ajax.reload();
}

function hide_request(request_id) {
    $('#hide_request_' + request_id).removeClass('glyphicon glyphicon-ban-circle').addClass('fa fa-spin fa-spinner');

    $.ajax({
        url: "request_hide.php",
        method: 'POST',
        cache: false,
        data: { request_id: request_id },
        success: function(data) {
            var tr = $('#tr_request_' + request_id);
            $('#tr_request_' + request_id).closest('table').dataTable().api().row(tr).remove().draw();

            $('.alerts').css('background-color', '#33393D');
            $('.alerts').hide().html('Request hidden.').fadeIn();

            update_review_count();
            update_review_trader_count();

        }
    });
}

function request_check_all(product_id) {
    var checked = $('#check_request_all_' + product_id).is(':checked');

    $('#table_request_' + product_id + ' input[type=checkbox]').prop('checked', checked);
    request_check();
}


function get_checked_request_ids(email) {

    var request_ids = Array();

    $('.table-main .request_checkbox>input[type=checkbox]:checked').each(function() {
        request_ids.push($(this).data('request_id'));
    });

    return request_ids;

}

function bulk_request_hide() {

    var request_ids = get_checked_request_ids(0);

    if (request_ids.length == 0) {
        $('.modal').modal('hide');
        return;
    }

    $('#hideRequestModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#hideRequestModal .btn-danger').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "request_hide.php",
        method: 'POST',
        cache: false,
        data: { request_ids: request_ids },
        success: function(data) {

            $('#hideRequestModal .modal-footer .btn').removeAttr('disabled');
            $('#hideRequestModal .btn-danger').html('Hide All');
            $('#hideRequestModal').modal('hide');

            jQuery.each(request_ids, function(index) {
                var tr = $('#tr_request_' + request_ids[index]);
                $('#tr_request_' + request_ids[index]).closest('table').dataTable().api().row(tr).remove().draw();
            });

            request_check();


            $('.alerts').css('background-color', '#33393D');
            $('.alerts').hide().html('Requests hidden.').fadeIn();

            update_review_count();
            update_review_trader_count();

        }
    });
}

function request_check() {
    var show_bulk = false;

    $('.table-main .request_checkbox>input[type=checkbox]:checked').each(function() {
        show_bulk = true;
    });

    if (show_bulk) $('.bulk-menu').show();
    else $('.bulk-menu').hide();
}

function email_voucher(request_id) {

    if (emailing_voucher_status) return;
    emailing_voucher_status = 1;

    $('[id^=email_request_]').removeClass('glyphicon glyphicon-envelope').addClass('fa fa-spin fa-spinner');

    $.ajax({
        url: "request_email.php",
        method: 'POST',
        cache: false,
        data: { request_id: request_id },
        success: function(data) {

            var tr = $('#tr_request_' + request_id);
            $('#tr_request_' + request_id).closest('table').dataTable().api().row(tr).remove().draw();
            if(data=='SHOW_ACCOUNT_MODAL'){
                show_account(false);
            }else{
                $('.alerts').css('background-color', '#33393D');
                $('.alerts').hide().html(data).fadeIn();
            }
            update_review_count();
            update_review_trader_count();

            $('[id^=email_request_]').addClass('glyphicon glyphicon-envelope').removeClass('fa fa-spin fa-spinner');
            emailing_voucher_status = 0;
        }
    });

}

function bulk_approve_vouchers() {

    if (emailing_voucher_status) {
        $('.modal').modal('hide');
        draw_alert("Still in the process of sending previous promo codes out. Please wait...");
        return;
    }
    emailing_voucher_status = 1;

    var request_ids = get_checked_request_ids(1);

    if (request_ids.length == 0) {
        $('.modal').modal('hide');
        return;
    }

    $('#approveVoucherModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#approveVoucherModal .btn-success').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "request_email.php",
        method: 'POST',
        cache: false,
        data: { request_ids: request_ids },
        success: function(data) {

            $('#approveVoucherModal .modal-footer .btn').removeAttr('disabled');
            $('#approveVoucherModal .btn-success').html('Approve');
            $('#approveVoucherModal').modal('hide');

            jQuery.each(request_ids, function(index) {
                var tr = $('#tr_request_' + request_ids[index]);
                $('#tr_request_' + request_ids[index]).closest('table').dataTable().api().row(tr).remove().draw();
            });

            request_check();


            if(data=='SHOW_ACCOUNT_MODAL'){
                show_account(false);
            }else{
                $('.alerts').css('background-color', '#33393D');
                $('.alerts').hide().html(data).fadeIn();
            }

            update_review_count();
            update_review_trader_count();


            emailing_voucher_status = 0;
        }
    });
}

function show_account_cancel() {
    $('.modal').modal('hide');
    $('#cancelSubscriptionModal .modal-body').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#cancelSubscriptionModal').modal('show');

    $.ajax({
        url: "account_cancel_modal.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('#cancelSubscriptionModal .modal-body').html(data);
        }
    });
}

function cancel_subscription() {
    if (($('#cancelSubscriptionModal input[name=confirm_cancel]').val() != "CANCEL") &&
        ($('#cancelSubscriptionModal input[name=confirm_cancel]').val() != "cancel")) {
        alert("ERROR - ACCOUNT NOT CANCELLED. Your account has NOT been cancelled, please follow the steps to cancel");
        return;
    }

    $('#cancelSubscriptionModal .btn-danger').attr('disabled', 'disabled').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');

    $.ajax({
        url: "account_cancel.php",
        method: 'POST',
        data: { token: $('#cancelSubscriptionModal input[name="_token"]').val() },
        cache: false,
        success: function(data) {
            draw_alert(data);

            $('#cancelSubscriptionModal').modal('hide');
            $('#cancelSubscriptionModal .btn-danger').removeAttr('disabled').html('Cancel Subscription');
        }
    });
}

function show_confirmed_table(product_id) {

    var tr = $('#tr_product_' + product_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {

        // This row is already open - close it
        $('#table_request_' + product_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');

        request_check();
    }
    else {
        // Open this row

        row.child('<i class="fa fa-spin fa-spinner"></i> Please Wait...').show();
        $(tr).find('td .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

        $.ajax({
            url: "confirmed-table.php",
            method: 'POST',
            cache: false,
            data: { product_id: product_id },
            success: function(data) {
                row.child( data ).show();

                tr.addClass('shown');

                $('#table_request_' + product_id).parent().css({ 'padding' : 0, 'height' : 0 });

                $('#table_request_' + product_id).DataTable({
                    "language": {
                        "zeroRecords": "There are currently no requests for this product."
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "order": [[ 3, "desc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 5, 6, 7, 8, 9, 10, 11 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="checkbox check-white confirmed_checkbox" style="margin: 0;">' +
                                        '<input id="check_confirmed_' + row[5] + '" type="checkbox" onclick="confirmed_check(' + row[5] + ')" data-request_id="' + row[5] + '"';

                                    if (row[0] == 1) display += ' checked';

                                    display += '> <label for="check_confirmed_' + row[5] + '"></label> </div>';

                                    return display;
                                }
                                else return row[0];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-rating",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = "";

                                    for (var i = 0; i < row[2]; i++) {
                                        display += "<span class='glyphicon glyphicon-star' style='margin-left:0; cursor: auto;'></span>";
                                    }
                                    return display;
                                }
                                else return row[2];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-review",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '<a href="http://' + row[11] + '/review/' + row[6] + '" target="_blank" style="font-weight: bold;">' + row[1] + '</a>' +
                                        '<p>' + row[7] + '</p>' +
                                        '<p class="volume"><a href="http://' + row[11] + '/dp/' + row[10] + '" target="_blank">' + row[10] + '</a></p>';

                                    return display;
                                }
                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-action",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '<a href="' + row[9] + '" target="_blank"><span class="glyphicon glyphicon-user has-tooltip" title="Show reviewer in Amazon"></span></a>' +
                                        '<a href="http://' + row[11] + '/review/' + row[6] + '" target="_blank"><span class="glyphicon glyphicon-new-window has-tooltip" title="Open review in Amazon"></span></a>';

                                    return display;
                                }
                                else return row[4];
                            }
                        },





                    ],
                    "drawCallback": function( settings ) {
                        var api = this.api();


                        if (api.rows().data().length == 0) {
                            $(api.table().header()).hide();
                        }
                    }

                });

                $('#table_request_' + product_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();
            }
        });
    }
}


function confirmed_check(request_id) {
    $('tr#tr_request_' + request_id +' td:first-child').html('<i class="fa fa-spin fa-spinner"></i>');

    $.ajax({
        url: "confirmed_check.php",
        method: 'POST',
        cache: false,
        data: { request_id: request_id },
        success: function(data) {

            var innerhtml = '<div class="checkbox check-white" style="margin: 0;">' +
                '<input id="check_confirmed_' + request_id + '" type="checkbox" onclick="confirmed_check(' + request_id + ')" ';

            if (data == 1) innerhtml += 'checked';

            innerhtml += '><label for="check_confirmed_' + request_id +'"></label></div>';

            $('tr#tr_request_' + request_id +' td:first-child').html(innerhtml);
        }
    });
}

// Super URLs

function edit_redirection(redirection_id) {
    $('#superURLModal').html('<div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modalName">Super URL</h4> </div> <div class="modal-body"> <i class="fa fa-spin fa-spinner"></i> Please Wait... </div> <div class="modal-footer"></div> </div><!-- /.modal-content --> </div><!-- /.modal-dialog -->');
    $('#superURLModal').modal('show');

    $.ajax({
        url: "super_url_modal.php",
        method: 'POST',
        cache: false,
        data: { redirection_id: redirection_id },
        success: function(data) {
            $('#superURLModal').html(data);
        }
    });
}

//Advanced Super URLs

function edit_advanced_super_url(redirection_id) {
    $('#AdvancedsuperURLModal').html('<div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modalName">Super URL</h4> </div> <div class="modal-body"> <i class="fa fa-spin fa-spinner"></i> Please Wait... </div> <div class="modal-footer"></div> </div><!-- /.modal-content --> </div><!-- /.modal-dialog -->');
    $('#AdvancedsuperURLModal').modal('show');

    $.ajax({
        url: "advanced_super_url_modal.php",
        method: 'POST',
        cache: false,
        data: { redirection_id: redirection_id },
        success: function(data) {
            $('#AdvancedsuperURLModal').html(data);
        }
    });
}

function select_all_super_url_keywords() {
    if ($('#superURLModal #super-url-keywords input[id=check_keyword_all_super_url]').is(':checked')) $('#superURLModal #super-url-keywords input[id^=check_keyword_keyword_id_]').prop('checked', true);
    else $('#superURLModal #super-url-keywords input[id^=check_keyword_keyword_id_]').prop('checked', false);
}

function select_all_super_url_asins() {
    if ($('#superURLModal #super-url-asins input[id=check_asins_all]').is(':checked')) $('#superURLModal #super-url-asins input[id^=check_asin_child_id_]').prop('checked', true);
    else $('#superURLModal #super-url-asins input[id^=check_asin_child_id_]').prop('checked', false);
}

function save_super_url() {
    $('#superURLModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#superURLModal .modal-footer .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "super_url_save_check.php",
        method: 'POST',
        cache: false,
        data: $('#superURLModal form').serialize(),
        success: function(data) {
            if (data != "") {
                alert(data);
                $('#superURLModal .modal-footer .btn').removeAttr('disabled');
                $('#superURLModal .modal-footer .btn-primary').html('Save');
                return;
            }


            $.ajax({
                url: "super_url_save.php",
                method: 'POST',
                cache: false,
                data: $('#superURLModal form').serialize(),
                success: function(data) {
                    $('#superURLModal').modal('hide');

                    refresh_table('Super URL saved');
                }
            });
        }
    });
}

function save_advanced_super_url() {

    $('#AdvancedsuperURLModal .modal-footer .btn').attr('disabled', 'disabled');
    $('#AdvancedsuperURLModal .modal-footer .btn-primary').html('<i class="fa fa-spin fa-spinner"></i> Please Wait');

    $.ajax({
        url: "advanced_super_url_save.php",
        method: 'POST',
        cache: false,
        data: $('#AdvancedsuperURLModal form').serialize(),
        success: function(data) {
            $('#AdvancedsuperURLModal').modal('hide');

            refresh_table('Advanced Super URL saved');
        }
    });


}

function add_super_url(product_id) {
    $('#superURLModal').html('<div class="modal-dialog modal-lg"> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h4 class="modalName">Super URL</h4> </div> <div class="modal-body"> <i class="fa fa-spin fa-spinner"></i> Please Wait... </div> <div class="modal-footer"></div> </div><!-- /.modal-content --> </div><!-- /.modal-dialog -->');
    $('#superURLModal').modal('show');

    $.ajax({
        url: "super_url_modal.php",
        method: 'POST',
        cache: false,
        data: { redirection_id: -1, product_id: product_id },
        success: function(data) {
            $('#superURLModal').html(data);

            if (product_id == -1) {


                $('#table_super_url_product').DataTable({
                    "language": {
                        "zeroRecords": "There are currently no products.",
                        "pagingType": "full_numbers",
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "order": [[ 0, "desc" ]],
                    "columnDefs": [
                        {
                            "targets": [ 0 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    if (row[0] == 1) return '<span class="glyphicon glyphicon-star fav-on"></span>';
                                    else return '<span class="glyphicon glyphicon-star fav-off"></span>';

                                    return display;
                                }
                                else return row[0];
                            }
                        }
                    ]
                });

            }
        }
    });

}


function show_redirection_keywords(redirection_id) {

    var tr = $('#tr_redirection_' + redirection_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {
        // This row is already open - close it
        $('#table_redirection_' + redirection_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right')
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-down').removeClass('glyphicon-chevron-down')
    }
    else {
        // Open this row
        row.child( '<i class="fa fa-spin fa-spinner"></i> Please Wait...' ).show();
        tr.addClass('shown');

        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-right').addClass('glyphicon-chevron-down')
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right')

        $.ajax({
            url: "super-url-table-keywords.php",
            method: 'POST',
            cache: false,
            data: { redirection_id: redirection_id },
            success: function(data) {
                row.child( data ).show();


                $('#table_redirection_keywords_' + redirection_id).parent().css({ 'padding' : 0, 'height' : 0 });

                $('#table_redirection_keywords_' + redirection_id).DataTable({
                    "language": {
                        "zeroRecords": "<a href='javascript:void(0)' onclick='edit_redirection(" + redirection_id + ")'>Click here to add keywords</a>"
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "order": [[ 1, "desc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 7, 9, 10, 11, 12, 13, 14, 15 ] },
                        {
                            "targets": [ 6 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    if (row[12] == "1") {
                                        var change = "-";

                                        if (row[6] != "x") {
                                            if (row[7] > 0) change = "<span style='color: #009f3c; font-weight: bold;'>+" + row[7] + "</span>";
                                            if (row[7] < 0) change = "<span style='color: #FF0000; font-weight: bold;'>" + row[7] + "</span>";
                                            if (row[7] == 0) change = "-";

                                            var rank = "<span style='font-weight: bold;'>" + row[6] + "</span>";
                                            if (row[6] == '') rank = '<span class="has-tooltip" title="Not in top 300">> 300</span>';

                                            return "<div class='group'>" + rank + "</div>" +
                                                "<div class='group'>" + change + "</div>";
                                        }
                                        else return '<span class="glyphicon glyphicon-time has-tooltip" title="Keyword not updated yet. Won\'t be long!"></span>';
                                    }
                                    return "<span class='clickable has-tooltip' style='color: #428bca;' title='Click to start tracking' onclick='$(this).html(\"Please wait...\"); add_keyword_single(\"" + row[2] + "\", " + row[10] + ", \"" + row[15] + "\", " + row[13] + ")'>Not tracked</span>";
                                }
                                else {
                                    if (row[6] == "") return 10000;
                                    else return row[6];
                                }
                            }
                        },
                        {
                            "targets": [ 0 ],
                            "data": function (row, type, set, meta) {

                                if (type === "display") {
                                    var display_col = '<div class="checkbox check-white has-tooltip" style="margin: 0;" title="Tick to enable the use of this keyword in the Super URL">';

                                    if (row[0] == 0) display_col += '<input id="check_redirection_keyword_' + row[13] + '" type="checkbox" onclick="toggle_redirection(' + row[13] +', ' + row[14] + ', ' + row[9] + ')">';
                                    else display_col += '<input id="check_redirection_keyword_' + row[13] + '" type="checkbox" onclick="toggle_redirection(' + row[13] +', ' + row[14] + ', ' + row[9] + ')" checked>';

                                    display_col += '<label for="check_redirection_keyword_' + row[13] + '"></label></div>';

                                    return display_col;
                                }
                                else if (type === "set") {
                                    row[0] = set;
                                }
                                else {
                                    return row[0];
                                }
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[12] == 1) {
                                        if (row[1] == 1) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[9] + " fav-on has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[9] + ", " + row[10] + ")'></span>";
                                        if (row[1] == 0) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[9] + " fav-off has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[9] + ", " + row[10] + ")'></span>";
                                    }
                                    else return "";
                                }
                                else {
                                    return row[1];
                                }
                            }

                        },
                        {
                            "targets": [ 2 ],
                            "data": function (row, type, set, meta) {

                                if (type === "display") {
                                    var display = row[2];

                                    if (row[11] != '') display += "<p class='volume'>Volume: " + row[11] + "</p>";

                                    return display;
                                }
                                else {
                                    return row[2];
                                }
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[0] == 1) return "<div contenteditable class='has-tooltip' id='redirection_weight_" + row[13] + "' onblur='redirection_weight_save(" + row[13] + ")' style='border-bottom: 1px dotted #ddd; width: 2em; margin: 0 auto;' title='Weight denotes the preference given to a keyword when redirecting. The higher the number, the more likely this keyword will be used.<br><br>Recommended values between 1 and 10.'>" + row[3] + "</div>";
                                    else return "";
                                }
                                else {
                                    return row[3];
                                }
                            }

                        },

                    ],
                    "drawCallback": function( settings ) {
                        var api = this.api();


                        if (api.rows().data().length == 0) {
                            $(api.table().header()).hide();
                        }
                    }

                });

                $('#table_redirection_keywords_' + redirection_id + ' [id^=redirection_weight]').keypress(function(e) {
                    return e.which != 13;
                });

                $('#table_redirection_keywords_' + redirection_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();


                $('#table_redirection_keywords_' + redirection_id + ' [id^=mini_graph_]').each(function() {

                    var keyword_id = $(this).closest('tr').data('keyword-id');

                    draw_mini_graph(keyword_id);


                });

            }
        });
    }
}

function show_advanced_redirection_keywords(redirection_id) {

    var tr = $('#tr_redirection_' + redirection_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {
        // This row is already open - close it
        $('#table_redirection_' + redirection_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right')
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-down').removeClass('glyphicon-chevron-down')
    }
    else {
        // Open this row
        row.child( '<i class="fa fa-spin fa-spinner"></i> Please Wait...' ).show();
        tr.addClass('shown');

        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-right').addClass('glyphicon-chevron-down')
        $(tr).find('td.td-chevron .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right')

        $.ajax({
            url: "advanced-super-url-table-keywords.php",
            method: 'POST',
            cache: false,
            data: { redirection_id: redirection_id },
            success: function(data) {
                row.child( data ).show();


                $('#table_redirection_keywords_' + redirection_id).parent().css({ 'padding' : 0, 'height' : 0 });

                $('#table_redirection_keywords_' + redirection_id).DataTable({
                    "language": {
                        "zeroRecords": "<a href='javascript:void(0)' onclick='edit_redirection(" + redirection_id + ")'>Click here to add keywords</a>"
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "order": [[ 1, "desc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 7, 9, 10, 11, 12, 13, 14, 15 ] },
                        {
                            "targets": [ 6 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    if (row[12] == "1") {
                                        var change = "-";

                                        if (row[6] != "x") {
                                            if (row[7] > 0) change = "<span style='color: #009f3c; font-weight: bold;'>+" + row[7] + "</span>";
                                            if (row[7] < 0) change = "<span style='color: #FF0000; font-weight: bold;'>" + row[7] + "</span>";
                                            if (row[7] == 0) change = "-";

                                            var rank = "<span style='font-weight: bold;'>" + row[6] + "</span>";
                                            if (row[6] == '') rank = '<span class="has-tooltip" title="Not in top 300">> 300</span>';

                                            return "<div class='group'>" + rank + "</div>" +
                                                "<div class='group'>" + change + "</div>";
                                        }
                                        else return '<span class="glyphicon glyphicon-time has-tooltip" title="Keyword not updated yet. Won\'t be long!"></span>';
                                    }
                                    return "<span class='clickable has-tooltip' style='color: #428bca;' title='Click to start tracking' onclick='$(this).html(\"Please wait...\"); add_keyword_single(\"" + row[2] + "\", " + row[10] + ", \"" + row[15] + "\", " + row[13] + ")'>Not tracked</span>";
                                }
                                else {
                                    if (row[6] == "") return 10000;
                                    else return row[6];
                                }
                            }
                        },
                        {
                            "targets": [ 0 ],
                            "data": function (row, type, set, meta) {

                                if (type === "display") {
                                    var display_col = '<div class="checkbox check-white has-tooltip" style="margin: 0;" title="Tick to enable the use of this keyword in the Super URL">';

                                    if (row[0] == 0) display_col += '<input id="check_redirection_keyword_' + row[13] + '" type="checkbox" onclick="toggle_redirection(' + row[13] +', ' + row[14] + ', ' + row[9] + ')">';
                                    else display_col += '<input id="check_redirection_keyword_' + row[13] + '" type="checkbox" onclick="toggle_redirection(' + row[13] +', ' + row[14] + ', ' + row[9] + ')" checked>';

                                    display_col += '<label for="check_redirection_keyword_' + row[13] + '"></label></div>';

                                    return display_col;
                                }
                                else if (type === "set") {
                                    row[0] = set;
                                }
                                else {
                                    return row[0];
                                }
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[12] == 1) {
                                        if (row[1] == 1) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[9] + " fav-on has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[9] + ", " + row[10] + ")'></span>";
                                        if (row[1] == 0) return "<span class='glyphicon glyphicon-star keyword_fav_" + row[9] + " fav-off has-tooltip' title='Click to toggle favorite' onclick='toggle_keyword_favorite(" + row[9] + ", " + row[10] + ")'></span>";
                                    }
                                    else return "";
                                }
                                else {
                                    return row[1];
                                }
                            }

                        },
                        {
                            "targets": [ 2 ],
                            "data": function (row, type, set, meta) {

                                if (type === "display") {
                                    var display = row[2];

                                    if (row[11] != '') display += "<p class='volume'>Volume: " + row[11] + "</p>";

                                    return display;
                                }
                                else {
                                    return row[2];
                                }
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[0] == 1) return "<div contenteditable class='has-tooltip' id='redirection_weight_" + row[13] + "' onblur='redirection_weight_save(" + row[13] + ")' style='border-bottom: 1px dotted #ddd; width: 2em; margin: 0 auto;' title='Weight denotes the preference given to a keyword when redirecting. The higher the number, the more likely this keyword will be used.<br><br>Recommended values between 1 and 10.'>" + row[3] + "</div>";
                                    else return "";
                                }
                                else {
                                    return row[3];
                                }
                            }

                        },

                    ],
                    "drawCallback": function( settings ) {
                        var api = this.api();


                        if (api.rows().data().length == 0) {
                            $(api.table().header()).hide();
                        }
                    }

                });

                $('#table_redirection_keywords_' + redirection_id + ' [id^=redirection_weight]').keypress(function(e) {
                    return e.which != 13;
                });

                $('#table_redirection_keywords_' + redirection_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();


                $('#table_redirection_keywords_' + redirection_id + ' [id^=mini_graph_]').each(function() {

                    var keyword_id = $(this).closest('tr').data('keyword-id');

                    draw_mini_graph(keyword_id);


                });

            }
        });
    }
}

function toggle_redirection(redirection_keyword_id, redirection_id, keyword_id) {
    $('tr#tr_redirection_keyword_' + redirection_keyword_id +' td:first-child').html('<i class="fa fa-spin fa-spinner"></i>');

    $.ajax({
        url: "redirection_toggle.php",
        method: 'POST',
        cache: false,
        data: { redirection_keyword_id: redirection_keyword_id, redirection_id: redirection_id, keyword_id: keyword_id },
        success: function(data) {

            var result = jQuery.parseJSON(data);

            var tr = $('#tr_redirection_keyword_' + redirection_keyword_id);
            var row = $('#tr_redirection_keyword_' + redirection_keyword_id).closest('table').dataTable().api().row(tr);

            $('#tr_redirection_keyword_' + redirection_keyword_id).attr('id', 'tr_redirection_keyword_' + result.redirection_keyword_id);

            $('#table_redirection_keywords_' + redirection_id).dataTable().api().cell(tr, 0).data(result.active);
            $('#table_redirection_keywords_' + redirection_id).dataTable().api().cell(tr, 13).data(result.redirection_keyword_id).draw();

            var checked_count = 0;

            $('#table_redirection_keywords_' + redirection_id +' tbody>tr').each(function() {
                if ($(this).children(':first').find('input').is(':checked')) checked_count++;
            });

            var tr = $('#tr_redirection_' + redirection_id);
            dTable.cell(tr, 4).data(checked_count).draw();
        }
    });
}


function redirection_weight_save(redirection_keyword_id) {
    var weight = $('#redirection_weight_' + redirection_keyword_id).html();

    if (!isInt(weight)) {
        $('#redirection_weight_' + redirection_keyword_id).html(1);
        weight = 1;
    }

    $.ajax({
        url: "redirection_weight_save.php",
        method: 'POST',
        cache: false,
        data: { redirection_keyword_id: redirection_keyword_id, weight: weight },
        success: function(data) {
        }
    });

}


function delete_redirection(redirection_id, product_id) {
    var product_name = $('.product_name_' + product_id).html();

    $('#deleteModal input[name=delete_id]').val(redirection_id);
    $('#deleteModal input[name=delete_table]').val('tbl_redirection');
    $('#deleteModal .delete-name').html(product_name);
    $('#deleteModal').modal('show');
}


function show_redirection(message) {
    current_table = "redirection";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .redirection-icon').addClass('active');


    $.ajax({
        url: "super-url-table.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('.container').html(data);

            if (data == '') {
                $('#addProductsModal .close').hide();
                $('#addProductsModal .btn-default').hide();
                // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
                $('#addProductsModal').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
            else {
                $('#addProductsModal .close').show();
                $('#addProductsModal .btn-default').show();

                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "order": [[ 11, "desc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_redirection_keywords(' + row[15] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row[12] == 0) display += ' fav-off ';
                                    if (row[12] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row[7] + '" onclick="toggle_product_favorite(' + row[7] + ', 11)"></span>';
                                    display += '</div>';

                                    if (row[13] != '') display += '<img src="' + row[13] + '" class="product-image" onclick="show_redirection_keywords(' + row[15] + ')">';


                                    return display;
                                }
                                else return 1-row[12];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<p class="product_name_' + row[7] + '">' + row[1] + '</p><p class="asin"><img src="images/flags/' + row[10] + '.png" style="margin-right: 10px;">' + row[8];

                                    if (row[17] != "") display += " / <span class='has-tooltip' title='Merchant ID' data-placement='bottom'>" + row[17] + "</span>";

                                    display += "</p>";

                                    if (row[11] != "") display += '<p class="asin">' + row[11] + '</p>';
                                    if (row[14] != "") display += '<p class="asin">' + row[14] + '</p>';

                                    return display;
                                }

                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-sales-rank",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var sales_rank = row[2];
                                    if (sales_rank == 0) sales_rank = "-";

                                    display = '<div class="has-tooltip" title="Sales Rank / Rank Change.<br>Click to see Sales Rank Graph">' +
                                        sales_rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br>';

                                    if (row[16] < 0) display += '<span style="color: #f00; font-size: 11px;">' + row[16].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';
                                    if (row[16] > 0) display += '<span style="color: #009f3c; font-size: 11px;">+' + row[16].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';

                                    display += '</div>' + '<p class="product_group">' + row[9] + '</p>';

                                    return display;
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 5 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return '<a href="' + row[5] + '" target="_blank">' + row[5] + '</a>';
                                }

                                else return row[5];
                            }
                        }
                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();

                draw_alert(message);
            }
            $.ajax({
                url: "super-url-table.php?mode=showClicks",
                method: 'GET',
                cache: false,
                success: function(data) {
                    $.each(data, function(index, item){
                        var id = item.redirection_id;
                        var clicks = item.clicks;
                        $("tr#tr_redirection_"+id).find('td.td-clicks').html(clicks);
                    });
                    $('td.td-clicks div.overlay-loader').parent().html(0);

                }
            });
        }
    });
}

function show_advanced_super_url(message) {
    current_table = "stumbleupon";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .stumbleupon-icon').addClass('active');


    $.ajax({
        url: "advanced-super-url-table.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('.container').html(data);

            if (data == '') {
                $('#addProductsModal .close').hide();
                $('#addProductsModal .btn-default').hide();
                // $('#addProductsModal .modal-add-products-button').attr('disabled', 'disabled');
                $('#addProductsModal').modal({
                    keyboard: false,
                    backdrop: 'static'
                });
            }
            else {
                $('#addProductsModal .close').show();
                $('#addProductsModal .btn-default').show();

                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing..."
                    },

                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "pageLength": 50,
                    "paging": false,
                    "info": false,
                    "order": [[ 11, "desc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_redirection_keywords(' + row[15] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row[12] == 0) display += ' fav-off ';
                                    if (row[12] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row[7] + '" onclick="toggle_product_favorite(' + row[7] + ', 11)"></span>';
                                    display += '</div>';

                                    if (row[13] != '') display += '<img src="' + row[13] + '" class="product-image" onclick="show_redirection_keywords(' + row[15] + ')">';


                                    return display;
                                }
                                else return 1-row[12];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<p class="product_name_' + row[7] + '">' + row[1] + '</p><p class="asin"><img src="images/flags/' + row[10] + '.png" style="margin-right: 10px;">' + row[8];

                                    if (row[17] != "") display += " / <span class='has-tooltip' title='Merchant ID' data-placement='bottom'>" + row[17] + "</span>";

                                    display += "</p>";

                                    if (row[11] != "") display += '<p class="asin">' + row[11] + '</p>';
                                    if (row[14] != "") display += '<p class="asin">' + row[14] + '</p>';

                                    return display;
                                }

                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-sales-rank",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var sales_rank = row[2];
                                    if (sales_rank == 0) sales_rank = "-";

                                    display = '<div class="has-tooltip" title="Sales Rank / Rank Change.<br>Click to see Sales Rank Graph">' +
                                        sales_rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<br>';

                                    if (row[16] < 0) display += '<span style="color: #f00; font-size: 11px;">' + row[16].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';
                                    if (row[16] > 0) display += '<span style="color: #009f3c; font-size: 11px;">+' + row[16].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</span>';

                                    display += '</div>' + '<p class="product_group">' + row[9] + '</p>';

                                    return display;
                                }
                                else return row[3];
                            }
                        },
                        {
                            "targets": [ 5 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return '<a href="' + row[5] + '" target="_blank">' + row[5] + '</a>';
                                }

                                else return row[5];
                            }
                        }
                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();

                draw_alert(message);
            }
            $.ajax({
                url: "advanced-super-url-table.php?mode=showClicks",
                method: 'GET',
                cache: false,
                success: function(data) {
                    $.each(data, function(index, item){
                        var id = item.redirection_id;
                        var clicks = item.clicks;
                        $("tr#tr_redirection_"+id).find('td.td-clicks').html(clicks);
                    });
                    $('td.td-clicks div.overlay-loader').parent().html(0);

                }
            });
        }
    });
}

function check_merchant_id() {
    var url = $('#superURLModal input[name=url]').val();
    var merchant_id = $('#superURLModal input[name=merchant_id]').val();

    if (url.indexOf("?") > -1) url += "&m=" + merchant_id;
    else url += "?m=" + merchant_id;

    window.open(url,'_blank');
}

function check_merchant_id_product(domain, asin) {
    var merchant_id = $('#editProductModal input[name=merchant_id]').val();
    var url = "http://" + domain +"/dp/" + asin + "?m=" + merchant_id;

    window.open(url,'_blank');

}

function check_art_vouchers() {
    var vouchers = $('#art_voucher').val().trim();

    if (vouchers.search("\n") != -1) $('#multiple_voucher').prop('checked', true);

    art_check_pause();
}

function amz_anonymize() {
    anonymize_links();
}

function art_update_fba() {
    if ($('#art_fba').val() == "FBA") {
        $('#art_shipping').val(0)
        $('#art_shipping_form_group').hide();
    }
    else {
        $('#art_shipping').val('')
        $('#art_shipping_form_group').show();
    }
}

function art_check_pause() {

    var pauseReason = [];
    var currentDate = new Date();
    var expiryDate = new Date($('#artModal #art_expiry_date').data('datepicker').date);

    if ($('#artModal input[name=art_pause]').is(':checked')) pauseReason.push("Pause Listing checked");
    if ($('#artModal #art_voucher').val() == '') pauseReason.push("No vouchers");
    if (currentDate >= expiryDate) pauseReason.push("Expiry date in the past or set to today");

    if (!pauseReason.length) {
        $('#artModal #art_paused_reason').html("Listing will be live once saved.");
    }
    else {
        $('#artModal #art_paused_reason').html("This listing is paused: " + pauseReason.join(', '));
    }
}

function art_update_total_price() {
    var total_price = $('#artModal #art_final_price').val();

    if (is_numeric($('#artModal #art_shipping').val())) total_price += $('#artModal #art_shipping').val();
}


function update_art_final_price() {
    if ((!is_numeric($('#art_final_price').val())) ||
        (!is_numeric($('#art_shipping').val()))) {
        $('#art_total_price').html('');
        return;
    }

    $('#art_total_price').html('Final Price: ' + (parseFloat($('#art_final_price').val()) + parseFloat($('#art_shipping').val())).toFixed(2));
}


// New Review Club

function show_review_trader_new(message) {

    current_table = "review_trader";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .review-trader-icon').addClass('active');


    $.ajax({
        url: "review-trader-table.php",
        method: 'POST',
        cache: false,
        data: { running_only: review_trader_show_running_listings_only },
        success: function(data) {

            $('.container').html(data);

            if (data != '') {
                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing...",
                        "emptyTable": "No data available in the table, try refreshing your browser or clearing your cache.",
                    },
                    "lengthMenu": [ 10, 50, 100, 500 ],
                    // "dom": 'lfrtpi',
                    "processing": true,
                    "serverSide": true,
                    "autoWidth": false,
                    "pageLength": 100,
                    "paging": true,
                    "info": false,
                    "ajax": {
                        "url": "review-trader-table-ajax.php",
                        "type": "POST",
                        "data": function(d) {
                            return $.extend( {}, d, {
                                "running_only": $('#show-running-only').is(':checked'),
                                "tag_filter": $('select.tag-filter').val(),
                            })
                        }
                    },
                    "drawCallback" : function(settings) {
                        $('.table-main .has-tooltip').tooltip({html: true});
                    },
                    "rowId": "row_id",
                    "columnDefs": [
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_request_table_new(' + row['product_id'] + ')"></span>';

                                    display += '<span class="glyphicon glyphicon-star';

                                    if (row['favorite'] == 0) display += ' fav-off ';
                                    if (row['favorite'] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row['product_id'] + '" onclick="toggle_product_favorite(' + row['product_id'] + ', \'favorite\')"></span>';
                                    display += '</div>';

                                    if (row['image'] != '') display += '<img src="' + row['image'] + '" class="product-image" onclick="show_art(' + row['product_id'] + ')">';

                                    return display;
                                }
                                else return 1-row['favorite'];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div onclick="show_art(' + row['product_id'] + ')"><p style="margin: 10px 0 2px 0;">';

                                    display += row['title'] + '</p>';

                                    display += '<div style="color:#999; font-size:10px">';
                                    if (row['error'] != '') display += '<span class="glyphicon glyphicon-exclamation-sign has-tooltip" title="WARNING: ' + row['error'] + '" style="color: #F35958; font-size: 15px; top: 4px; margin: 0 10px 0 0;"></span>';
                                    display += '<img src="images/flags/' + row['flag'] + '.png" style="margin-right: 10px;">' + row['asin'];

                                    if (row['tag'] != '') display += ' / ' + row['tag'];

                                    return display + '</div></div>';
                                }
                                else return row['title'];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['start'] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Start date not set'></span>";

                                    return row['start'];
                                }
                                else return row['start'];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['expiry'] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Expiry date not set'></span>";

                                    return row['expiry'];
                                }
                                else return row['expiry'];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-price",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row['currency_sign'] + row['final_price'] + '<div style="color:#999; font-size:10px">' + row['currency'] + '</div>';
                                }
                                else return row['final_price'];
                            }
                        },
                        {
                            "targets": [ 5 ],
                            "class": "td-action",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row['action'];
                                }
                                else return row['requests'];
                            }
                        },


                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();
                show_running_only()

                draw_alert(message);
            }
        }
    });
}

function show_suspicious_listings(message) {
    //current_table = "review_trader";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');


    $.ajax({
        url: "suspicious-listings-table.php",
        method: 'POST',
        cache: false,
        data: {},
        success: function(data) {
            $('.container').html(data);

            if (data != '') {
                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing...",
                        "emptyTable": "No data available in the table, try refreshing your browser or clearing your cache.",
                    },
                    "lengthMenu": [ 10, 50, 100, 500 ],
                    // "dom": 'lfrtpi',
                    "processing": true,
                    "serverSide": true,
                    "autoWidth": false,
                    "pageLength": 100,
                    "paging": true,
                    "info": false,
                    "ajax": {
                        "url": "suspicious-listings-table-ajax.php",
                        "type": "POST",
                        "data": function(d) {
                            return $.extend( {}, d, {
                                "running_only": $('#show-running-only').is(':checked'),
                                "tag_filter": $('select.tag-filter').val(),
                            })
                        }
                    },
                    "drawCallback" : function(settings) {
                        $('.table-main .has-tooltip').tooltip({html: true});
                    },
                    "rowId": "row_id",
                    "columnDefs": [
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon" style="padding-bottom: 9px;"></span>';

                                    display += '<span class="';

                                    if (row['favorite'] == 0) display += ' fav-off ';
                                    if (row['favorite'] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row['product_id'] + '"></span>';
                                    display += '</div>';

                                    if (row['image'] != '') display += '<img src="' + row['image'] + '" class="product-image">';

                                    return display;
                                }
                                else return 1-row['favorite'];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div onclick="window.open(\''+row['amazon_link']+'\');"><p style="margin: 10px 0 2px 0;">';

                                    display += row['title'] + '</p>';

                                    return display + '</div>';
                                }
                                else return row['title'];
                            }
                        },
                        {
                            "targets": [ 2 ],
                            "class": "td-email",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div><p style="margin: 10px 0 2px 0;">';

                                    display += row['email'] + '</p>';

                                    return display + '</div>';
                                }
                                else return row['email'];
                            }
                        },
                        {
                            "targets": [ 3 ],
                            "class": "td-code",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div><p style="margin: 10px 0 2px 0;">';

                                    display += row['code'] + '</p>';

                                    return display + '</div>';
                                }
                                else return row['code'];
                            }
                        },
                        {
                            "targets": [ 4 ],
                            "class": "td-single_code",
                            "data": function (row, type, set, meta) {
                                var type = !row['single_voucher'] ? 'Multiple' : 'Single';
                                if (type === "display") {
                                    var display = '<div><p style="margin: 10px 0 2px 0;">';

                                    display += type + '</p>';

                                    return display + '</div>';
                                }
                                else return type;
                            }
                        },
                        {
                            "targets":[5],
                            "class":"td-close-promotion",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div><p style="margin: 10px 0 2px 0;">';

                                    display += row['create'] + '</p>';

                                    return display + '</div>';
                                }
                                else return row['create'];
                            }
                        },
                        {
                            "targets":[6],
                            "class":"td-close-promotion",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['is_hide'] == '1') {
                                        return '<span class="glyphicon has-tooltip" title="" style="color: #F35958;" data-original-title="close promotion.">Closed</span>';
                                    } else {
                                        return '<span class="glyphicon glyphicon-play has-tooltip" onclick="close_promotion(\''+row['product_id']+'\')" title="" style="color: #F35958;" data-original-title="close promotion."></span>';
                                    }
                                }
                                else return '';
                            }
                        },
                        {
                            "targets":[7],
                            "class":"td-suspend-seller",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['suspended']) {
                                        return '<span class="glyphicon has-tooltip" title="" style="color: #F35958;" data-original-title="suspend seller.">suspended</span>';
                                    } else {
                                        return '<span class="glyphicon glyphicon-play has-tooltip" onclick="suspend_seller(\''+row['email']+'\')" title="" style="color: #F35958;" data-original-title="suspend seller."></span>';
                                    }
                                }
                                else return '';
                            }
                        }

                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();
                show_running_only()

                draw_alert(message);
            }
        }
    });
}

function close_promotion(product_id)
{
    $.ajax({
        url: "suspicious-listings-table.php",
        method: 'POST',
        cache: false,
        data: {product_id:product_id, 'ajax':1},
        success: function (data) {
            var json = JSON.parse(data);

            if (json.code == '0') {
                show_suspicious_listings();

                draw_alert(json.message);
            }
        }
    });
}

function suspend_seller(email)
{
    $.ajax({
        url: "lists/suspend_sellers.php",
        method: 'POST',
        cache: false,
        data: {emails:email, 'ajax':1},
        success: function (data) {
            var json = JSON.parse(data);
            if (json.code == '0') {
                show_suspicious_listings();

                draw_alert(json.message);
            }
        }
    });
}




function show_job_market(message) {

    current_table = "job_market";

    var tables = $.fn.dataTable.fnTables(true);

    $(tables).each(function () {
        $(this).dataTable().fnDestroy();
    });

    $('.container').html('<div class="bottom"><div style="padding-top:40px"><i class="fa fa-spin fa-spinner"></i> Please Wait...</div></div>');

    $('.nav-inner .fa').removeClass('active');
    $('.nav-inner .job-market-icon').addClass('active');


    $.ajax({
        url: "job_market.php",
        method: 'POST',
        cache: false,
        data: { running_only: review_trader_show_running_listings_only },
        success: function(data) {

            $('.container').html(data);

            if (data != '') {
                dTable = $('.table-main').DataTable({
                    "pagingType": "full_numbers",
                    "language": {
                        "lengthMenu": "_MENU_",
                        "info": "Showing <strong>_START_ to _END_</strong> of _TOTAL_ entries",
                        "processing": "<i class='fa fa-spin fa-spinner'></i> Processing...",
                        "emptyTable": "No data available in the table, try refreshing your browser or clearing your cache.",
                    },
                    "lengthMenu": [ 10, 50, 100, 500 ],
                    // "dom": 'lfrtpi',
                    "processing": true,
                    "serverSide": true,
                    "autoWidth": false,
                    "pageLength": 10,
                    "paging": true,
                    "info": false,
                    "ajax": {
                        "url": "job_market_ajax.php",
                        "type": "POST",
                        "data": function(d) {
                            return $.extend( {}, d, {
                                "running_only": $('#show-running-only').is(':checked'),
                                "tag_filter": $('select.tag-filter').val(),
                            })
                        }
                    },
                    "drawCallback" : function(settings) {
                        $('.table-main .has-tooltip').tooltip({html: true});
                    },
                    "rowId": "row_id",
                    "columnDefs": [
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    var display = '<div class="chev-star"><span class="glyphicon glyphicon-chevron-right" style="padding-bottom: 9px;" onclick="show_request_table_new(' + row['product_id'] + ')"></span>';

                                  /*  display += '<span class="glyphicon glyphicon-star';

                                    if (row['favorite'] == 0) display += ' fav-off ';
                                    if (row['favorite'] == 1) display += ' fav-on ';

                                    display += 'product_fav_' + row['product_id'] + '" onclick="toggle_product_favorite(' + row['product_id'] + ', \'favorite\')"></span>';*/
                                    display += '</div>';
                                   /* if (row['image'] != '') display += '<img src="' + row['image'] + '" class="product-image" onclick="show_art(' + row['product_id'] + ')">';*/

                                    if (row['image'] != '') display += '<img src="' + row['image'] + '" class="product-image" >';

                                    return display;
                                }
                                else return 1-row['favorite'];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "class": "td-product",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    /*var display = '<div onclick="show_art(' + row['product_id'] + ')"><p style="margin: 10px 0 2px 0;">';*/
                                    var display = '<div ><p style="margin: 10px 0 2px 0;">';
                                    display += row['title'] + '</p>';

                                    if (row['job_title'] != '')display += ' <p> ' + row['job_title']+'</p>';
                                    display += '<div style="color:#999; font-size:10px">';
                                    if (row['error'] != '') display += '<span class="glyphicon glyphicon-exclamation-sign has-tooltip" title="WARNING: ' + row['error'] + '" style="color: #F35958; font-size: 15px; top: 4px; margin: 0 10px 0 0;"></span>';
                                    if (row['asin'] != null)  display += '<img src="images/flags/' + row['flag'] + '.png" style="margin-right: 10px;">' + row['asin'] ;
                                    if (row['asin'] != null&&Number(row['job_price'] )!= 0.00)display +=  ' / ';
                                    if (Number(row['job_price'] )!= 0.00) display +='<span style="color:green">'+'$' +row['job_price']+'</span>';
                                    if (row['job_application_nums'] != null && row['job_application_nums'] !=0 ){
                                        display +=  '&nbsp;&nbsp;&nbsp;'+ row['job_application_nums']+' / ';
                                    } else if (Number(row['job_task_num'] )>0){
                                        display +=  '&nbsp;&nbsp;&nbsp;0/ ';
                                    }
                                    if (Number(row['job_task_num'] )!= 0) display +=  row['job_task_num'];
                                    return display + '</div></div>';
                                }
                                else return row['title'];
                            }
                        },
                        /*{
                            "targets": [ 2 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['start'] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Start date not set'></span>";

                                    return row['start'];
                                }
                                else return row['start'];
                            }
                        },*/
                      /*  {
                            "targets": [ 3 ],
                            "class": "td-date",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row['expiry'] == "") return "<span class='glyphicon glyphicon-exclamation-sign has-tooltip' title='Expiry date not set'></span>";

                                    return row['expiry'];
                                }
                                else return row['expiry'];
                            }
                        },*/
                       /* {
                            "targets": [ 4 ],
                            "class": "td-price",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row['currency_sign'] + row['final_price'] + '<div style="color:#999; font-size:10px">' + row['currency'] + '</div>';
                                }
                                else return row['final_price'];
                            }
                        },*/
                        {
                            "targets": [ 2 ],
                            "class": "td-action",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row['action'];
                                }
                                else return row['requests'];
                            }
                        },


                    ]
                })

                $('.table-main .has-tooltip').tooltip({html: true});
                amz_anonymize();
                show_running_only()

                draw_alert(message);
            }
        }
    });
}

function show_request_table_new(product_id) {

    var tr = $('#tr_product_' + product_id);
    var row = dTable.row( tr );

    if ( row.child.isShown() ) {

        // This row is already open - close it
        $('#table_request_' + product_id).dataTable().api().destroy();
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td .glyphicon.glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down');

        request_check();
    }
    else {
        // Open this row

        row.child('<i class="fa fa-spin fa-spinner"></i> Please Wait...').show();
        $(tr).find('td .glyphicon.glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');

        $.ajax({
            url: "request-table-new.php",
            method: 'POST',
            cache: false,
            data: { product_id: product_id },
            success: function(data) {
                row.child( data ).show();

                tr.addClass('shown');

                $('#table_request_' + product_id).parent().css({ 'padding' : 0, 'height' : 0 });

                $('#table_request_' + product_id).DataTable({
                    "language": {
                        "zeroRecords": "There are currently no requests for this product. <span onclick='show_art(" + product_id + ")' style='text-decoration: underline; cursor: pointer;'>Click here</span> to set up promotion options for this product."
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,
                    "order": [[ 9, "asc" ]],
                    "columnDefs": [
                        { "visible": false, "targets": [ 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 ] },
                        {
                            "targets": [ 0 ],
                            "class": "td-chevron",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    if (row[14] == "") return '<div class="checkbox check-white request_checkbox can-email" style="margin: 0;"> <input id="check_request_' + row[10] + '" type="checkbox" onclick="request_check()" data-request_id="' + row[10] + '"> <label for="check_request_' + row[10] + '"></label> </div>';
                                    else return '<div class="checkbox check-warning request_checkbox has-tooltip" title="WARNING:' + row[14] + '" style="margin: 0;"> <input id="check_request_' + row[10] + '" type="checkbox" onclick="request_check()" data-request_id="' + row[10] + '"> <label for="check_request_' + row[10] + '"></label> </div>';
                                }
                                else return row[0];
                            }
                        },
                        {
                            "targets": [ 1 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return "<div>" + row[1] + "</div><div>";
                                }
                                else return row[1];
                            }
                        },
                        {
                            "targets": [ 6 ],
                            "data": function (row, type, set, meta) {
                                if (type === "display") {
                                    return row[6];
                                }
                                else return row[6];
                            }
                        },
                        {
                            "targets": [ 9 ],
                            "class": "td-action",
                            "data": function (row, type, set, meta) {
                                if (type === "display") {

                                    var display = '';

                                    if (row[12] == "0") display += "<span class='glyphicon glyphicon-ban-circle has-tooltip' title='Delete request' onclick='hide_request(" + row[10] + ")' id='hide_request_" + row[10] + "' style='margin-right: 4px; color: #e74c3c;'></span>";
                                    if (row[13] == "0") {
                                        if (row[20] == 0) {
                                            display += "<span class='glyphicon glyphicon-envelope has-tooltip' title='Email voucher' onclick='email_voucher(" + row[10] + ")' id='email_request_" + row[10] + "' style='color: #2ecc71;'></span>";
                                        }
                                        else {
                                            display += "<span class='glyphicon glyphicon-envelope has-tooltip' title='Shopper has reached their code limit' id='email_request_" + row[10] + "' style='color: #ddd'></span>";
                                        }
                                    }

                                    return display;
                                }
                                else return row[20];
                            }
                        },
                    ],
                    "drawCallback": function( settings ) {
                        var api = this.api();


                        if (api.rows().data().length == 0) {
                            $(api.table().header()).hide();
                        }
                    }

                });

                $('#table_request_' + product_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();
            }
        });
    }
}

function message_modal(title, body, button) {
    $('#messageModal .modal-header h4').html(title);
    $('#messageModal .modal-body').html(body);
    $('#messageModal .modal-footer .btn').html(button);

    $('#messageModal').modal('show');
}
// Get Unicorn Smasher

function show_smasher(message) {
    // $('.side-bar').css({'left':'0px !important','right':'1670px !important','margin-right':'0px !important'});
   $('.nav-inner .fa').removeClass('active');
   $('.nav-inner .smasher-icon').addClass('active');
    $.ajax({
        url: "unicorn_smasher.php",
        method: 'GET',
        cache: false,
        success: function(data) {
            $('.container').html(data);
        }
    });
}
/*
*显示job 申请列表
 */
function show_application(post_id,product_id) {
//修改状态后 调用这个函数 会收起展示列表 待修改----sign by ywq
    var tr;
    var row;

    if(product_id==0){
        tr = $('#tr_product_' + post_id);
        row = $('#tr_product_' + post_id).closest('table').dataTable().api().row(tr);
    }else{
        tr = $('#tr_product_' + product_id);
        row = $('#tr_product_' + product_id).closest('table').dataTable().api().row(tr);
    }



    if ( row.child.isShown() ) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-down').addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down')
    }
    else {
        // Open this row
        row.child( "<div id='job_application_" + post_id + "'><i class='fa fa-spin fa-spinner'></i> Please Wait...</div>" ).show();
        tr.addClass('shown');
        $(tr).find('td.td-chevron .glyphicon-chevron-right').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');


        $.ajax({
            url: "job_application.php",
            method: 'POST',
            cache: false,
            data: { job_post_id: post_id },
            success: function(data) {

                $('#job_application_' + post_id).html(data);
           /*     $('#job_application_table_' + post_id).DataTable({
                    "language": {
                        "zeroRecords": "There is currently no data for this job. Won't be long!"
                    },
                    "dom": 'lfrtpi',
                    "processing": false,
                    "autoWidth": false,
                    "paging": false,
                    "searching": false,
                    "info": false,

                    "columnDefs": [
                        {
                            "targets": [0],
                            "data": function (row, type, set, meta) {
                                    return row[0];
                            }


                        },
                        {
                            "targets": [1],
                            "data": function (row, type, set, meta) {
                                 return row[1];
                            }
                        },
                        {
                            "targets": [2],
                            "data": function (row, type, set, meta) {
                               return row[2];
                            }
                        },
                        {
                            "targets": [3],
                            "data": function (row, type, set, meta) {
                               return row[3];
                            }
                        },
                        {
                            "targets": [4],
                            "data": function (row, type, set, meta) {
                                return row[4];
                            }
                        },
                        {
                            "targets": [5],
                            "data": function (row, type, set, meta) {
                               return row[5];
                            }
                        },

                    ]
                });*/

                $('#job_application_table_' + post_id + ' .has-tooltip').tooltip({html: true});
                amz_anonymize();
                $('#job_application_' + post_id).parent().css({ 'padding' : 0, 'height' : 0 }).attr('style', 'background-color: #CBD0D3; padding:0; heaight: 0;');


            }
        });
    }

}
/**/
function change_application(job_application_id){
    $('#agreeApplication .modal-save-product-button').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#agreeApplication .modal-footer .btn').attr('disabled', 'disabled');


    // update application status
    $.ajax({
        url: "change_application.php",
        method: 'POST',
        cache: false,
        data: {
            application_id: job_application_id,
            application_status_id: 1,//update status of application from 0 to 1
            tag:1
        },
        success: function(data) {
            $('#agreeApplication .modal-save-product-button').html('Save');
            $('#agreeApplication .modal-footer .btn').removeAttr('disabled');
            $('#agreeApplication').modal('hide');
            var result = $.parseJSON(data);
            show_application(result.job_post_id,result.product_id);
        }
    });
}
/*
*
*/
function delete_application(job_application_id){
    $('#deleteApplication .modal-save-product-button').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#deleteApplication .modal-footer .btn').attr('disabled', 'disabled');


    // update application status
    $.ajax({
        url: "change_application.php",
        method: 'POST',
        cache: false,
        data: {
            application_id: job_application_id,
            application_status_id: 99,//update status of application from 0 to 1
            tag:2
        },
        success: function(post_id) {
            $('#deleteApplication .modal-save-product-button').html('Save');
            $('#deleteApplication .modal-footer .btn').removeAttr('disabled');
            $('#deleteApplication').modal('hide');

            show_application(post_id);
        }
    });
}

/*
*
 */
function confirm_status(job_application_id){
    $('#confirmApplication .modal-save-product-button').html('<i class="fa fa-spin fa-spinner"></i> Please Wait...');
    $('#confirmApplication .modal-footer .btn').attr('disabled', 'disabled');

    // update application status
    $.ajax({
        url: "change_application.php",
        method: 'POST',
        cache: false,
        data: {
            application_id: job_application_id,
            application_status_id: 9,//update status of application from 0 to 1
            tag:3
        },
        success: function(post_id) {
            $('#confirmApplication .modal-save-product-button').html('Save');
            $('#confirmApplication .modal-footer .btn').removeAttr('disabled');
            $('#confirmApplication').modal('hide');

            show_application(post_id);
        }
    });
}
