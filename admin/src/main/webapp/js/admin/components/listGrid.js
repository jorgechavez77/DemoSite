$(document).ready(function() {
	
	/**
	 * Bind a handler to trigger anytime a table row is clicked on any list grid. 
	 * 
	 * After assembling information, this will delegate to the specialized rowSelected
	 * handler for this particular kind of list grid.
	 */
	$('body').on('click', '.list-grid-table tbody tr', function() {
		var $tr = $(this);
		var $table = $tr.closest('table');
		var link = $tr.data('link');
		var listGridType = $table.data('listgridtype');
		var currentUrl = $table.data('currenturl');
		var fields = {};
		
		$tr.find('td').each(function() {
			var fieldName = $(this).data('fieldname');
			var value = $(this).text();
			fields[fieldName] = value;
		});
		
		$('body').trigger('listGrid-' + listGridType + '-rowSelected', [link, fields, currentUrl]);
	});
	
	/**
	 * The rowSelected handler for the main list grid simply needs to navigate to the given URL.
	 */
	$('body').on('listGrid-main-rowSelected', function(event, link, fields, currentUrl) {
		window.location = link;
	});
	
	/**
	 * The rowSelected handler for the inline list grid ...
	 */
	$('body').on('listGrid-inline-rowSelected', function(event, link, fields, currentUrl) {
		alert('hi');
	});
	
	/**
	 * The rowSelected handler for a toOne list grid needs to trigger the specific valueSelected handler 
	 * for the field that we are performing the to-one lookup on.
	 */
	$('body').on('listGrid-toOne-rowSelected', function(event, link, fields, currentUrl) {
		$('div.additional-foreign-key-container').trigger('valueSelected', fields);
	});
	
	/**
	 * The rowSelected handler for a simpleCollection list grid ...
	 */
	$('body').on('listGrid-basicCollection-rowSelected', function(event, link, fields, currentUrl) {
		var postData = {};
		
		for (var key in fields){
		    if (fields.hasOwnProperty(key)){
		    	postData["fields['" + key + "'].value"] = fields[key];
		    }
		}	
		
		$.post(currentUrl, postData, function(data) {
			replaceListGrid(data);
		})
		.fail(function(data) {
			alert('failed ' + data);
		});
	});
	
	/**
	 * The rowSelected handler for an adornedTarget list grid ...
	 */
	$('body').on('listGrid-adornedTarget-rowSelected', function(event, link, fields, currentUrl) {
		alert('handling row selected for an adornedTarget add');
	});
	
	/**
	 * This handler will fire for additional foreign key fields when the find button is clicked.
	 * 
	 * It is responsible for binding a valueSelected handler for this field as well as launching
	 * a list grid modal that will be used to select the to-one entity.
	 * 
	 * Note that we MUST unbind this handler when the modal is hidden as there could be many different
	 * to-one fields on an entity form.
	 */
    $('body').on('click', 'a.show-to-one-list-grid', function(event) {
    	var $container = $(this).closest('div.additional-foreign-key-container');
    	
    	// This handler will
    	$container.on('valueSelected', function(event, fields) {
    		debugger;
    		var $this = $(this);
    		var displayValueProp = $this.find('input.display-value-property').val();
    		
    		$this.find('input.value').val(fields['id']);
    		$this.find('input.display-value').val(fields[displayValueProp]);
    		
    		$('#modal').modal('hide');
    	});
    	
    	showLinkAsModal($(this).attr('href'), function() {
			$('div.additional-foreign-key-container').unbind('valueSelected');
    	});
    	
		return false;
    });
	
	$('body').on('click', 'a.sub-list-grid-add', function() {
    	showLinkAsModal($(this).attr('href'));
		return false;
	});
	
	$('body').on('submit', 'form.modal-form', function() {
		$.post(this.action, $(this).serialize(), function(data) {
			replaceListGrid(data);
	    });
		return false;
	});
	
	var replaceListGrid = function(data) {
		var $table = $(data).find('table');
		var tableId = $table.attr('id');
		$('#' + tableId).replaceWith($table);
		$('#modal').modal('hide');
	}
	
	var showLinkAsModal = function(link, onModalHide) {
		$.get(link, function(data) {
			var $data = $(data);
			
			$('body').append($data);
			$data.modal();
			
			$data.on('hidden', function() {
				if (onModalHide != null) {
					onModalHide();
				}
				$(this).remove();
			});
		});
	};
	
});

