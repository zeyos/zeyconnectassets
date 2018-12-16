(function() {

  // Comming from weblet
  // var countryFinder { ... }

  var _tpl, _fcty, _lang;
  var GOOGLE_CONTACTS_READER_URL;

  var blendBody;

  var apiKey   = 'AIzaSyB1EgdkahDAyTZpvsvF6eaXsCSvYk5aU1g';
  var clientId = '216902228159-p0uks0b4edfr4gc221230gjpbs94qd3v.apps.googleusercontent.com';
  var scopes   = 'https://www.googleapis.com/auth/contacts.readonly';

  window.addEvent('load', function() {
    _tpl = new gx.ui.Templates();
    _fcty = gx.zeyos.Factory;
    _lang = _;

    GOOGLE_CONTACTS_READER_URL = 'remotecall/'+APPID+'.services/google/contacts/';
    PREVIEW_DATA_URL = 'remotecall/'+APPID+'.services/preview/file/';
    IMPORT_DATA_URL = 'remotecall/'+APPID+'.services/import/';

    blendBody = new gx.ui.Blend(document.body, {
      'color': '#333',
      'freezeColor': '#333',
      'opacity': '0.8',
      'transition': 'quad:in',
      'duration': '300',
      'loader': true,
      'open': false,
      'z-index': 100

    });

    new Importer($('body'));
  });

  function showPop(title, content) {
    var pop = new gx.zeyos.Popup({
      content: content,
      y: 'top'
    });
    pop.show();
    window.parent.scroll(0,0);

    return pop;
  }

  function showError(title, err) {
    ZeyOSApi.showMsg(null, title, err, null, true);
  }

  var parentBody = $(parent.document.body);
  function loading(state) {
    if ( parentBody )
      parentBody.toggleClass('load', state);
  }

  function doRequest(options, file) {
    var req, opt = Object.merge({
      'onRequest': function(res) {
        loading(true);
        blendBody.show();
      },
      'onComplete': function() {
        blendBody.hide();
        loading(false);
      },
      'onFailure': function(xhr) {
        var json, errorText = xhr.responseText;
        try {
          json = JSON.decode(errorText);
          if ( json && json.error )
            errorText = json.error;

        } catch (e) {}
        showError(_('error.request', {'statuscode': xhr.status}), errorText);
      }
    }, options || {});

    if ( file ) {
      req = new Request.File(opt);
      req.addFile(file);
    } else
      req = new Request(opt);

    req.send();
    return req;
  }

  function buildFeedMsg(type, ico, text) {
    return new Element('div', {'class': 'feedMsg ' + type}).adopt(
      new Element('i', {'class': 'icon-' + ico}),
      new Element('span.txt', {'html': text})
    );
  }

  var Importer = new Class({

    Binds: ['getGoogleContacts', 'doImportData', 'startNewImport', 'updateTableFilterClasses', 'doFilterTableByText'],

    initialize: function(parent) {
      this.ui = {};

      this.filterNav = this.buildFilterNav();
      this.filterNav.addEvent('clickedFilter', this.updateTableFilterClasses);

      parent.adopt(_tpl.render(this.ui, {
        filterNav: this.filterNav.toElement()
      }, this.template.bind(this)));

      this.initComponent();
      this.startNewImport();
    },

    initComponent: function() {
      this.ui.importBtn.disabled = false;

      var _this = this;
      var showFilePopup = function() {
        _this.showFileInputPopup(this.get('data-access'));
      };

      this.ui.googleBtn.addEvent('click', this.getGoogleContacts);
      this.ui.excelBtn.addEvent('click', showFilePopup);
      this.ui.csvBtn.addEvent('click', showFilePopup);
      this.ui.outlookcsvBtn.addEvent('click', showFilePopup);
      this.ui.vcardBtn.addEvent('click', showFilePopup);
      this.ui.importBtn.addEvent('click', this.doImportData);

      this.ui.newImport.addEvent('click', this.startNewImport);

      this.ui.fulltextSearchInput.addEvent('keyup', function(event) {
        if ( event && event.key == 'enter') {
          this.doFilterTableByText();
          return;
        }

        var text = event.target.get('value');
        this.ui.fulltextSearchBtn.set('data-icon', '\ue800');
      }.bind(this));

      this.ui.fulltextSearchBtn.addEvent('click', this.doFilterTableByText);
    },

    doFilterTableByText: function(text) {
      if ( !this.previewTable )
        return;

      var filterText = this.ui.fulltextSearchInput.get('value');
      if ( !filterText || this.ui.fulltextSearchBtn.get('data-icon') === '\ue8b7' ) {
        this.ui.fulltextSearchInput.set('value', '');
        this.ui.fulltextSearchBtn.set('data-icon', '\ue800');
        this.previewTable.filterFullText(false);
      } else {
        this.previewTable.filterFullText(filterText);
        this.ui.fulltextSearchBtn.set('data-icon', '\ue8b7');
      }
    },

    startNewImport: function() {
      this.ui.table.hide();
      this.ui.successElmt.hide();
      this.ui.importMessages.hide();
      this.ui.wizard.show();

      this.previewTable = null;
      this.filterNav.resetCounter();
      this.filterNav.selectFilter('all');
      this.ui.fulltextSearchInput.set('value', '');
      this.ui.importBtn.set('html', _lang('import.do_import'));
      this.ui.importBtn.set('title', _lang('import.info.provide_source'));
      this.ui.importBtn.disabled = true;
      this.ui.fulltextSearchBtn.set('data-icon', '\ue800');

      this.ui.fulltextSearchInput.disabled = true;
      this.ui.fulltextSearchBtn.disabled = true;
      this.ui.fulltextSearchInput.set('title', _lang('import.info.provide_source'));

      this.ui.filterNavigation.addClass('disabled');

    },

    showFileInputPopup: function(type) {
      var _this = this;
      var pop = new FileUploadPopup(type);
      pop.addEvent('fileSelected', function(fileInput, contactType) {
        pop.destroy();
        pop = null;

        doRequest({
          'url': PLATFORM_BASE_URL + PREVIEW_DATA_URL + type + '?contacttype=' + contactType,
          'method': 'post',
          'onSuccess': function(res) {
            _this.processData(res);
          }
        }, fileInput);
      });
    },

    getGoogleContacts: function() {
      var _this = this;
      googleOAuth(apiKey, clientId, scopes,
        function(token) {
          if ( typeof token === 'object' )
            token = token.access_token;
          try {
            _this.requestGoogleContacts(token);
          } catch (e) {
            console.error(e.stack);
          }
        }, function(err) {
          showError(_lang('import.error.auth_fail'), err);
        }
      );
    },

    requestGoogleContacts: function(accessToken) {
      var _this = this;
      doRequest({
        'url': PLATFORM_BASE_URL + GOOGLE_CONTACTS_READER_URL + accessToken,
        'method': 'get',
        'onSuccess': function(res) {
          _this.processData(res);
        }
      });
    },

    processData: function(res) {
      var data;
      try {
        data = JSON.decode(res);
        if ( !data )
          throw 'Could not decode response: ' + data;

        if ( data.error )
          throw data.error;

      } catch(e) {
        showError(_lang('import.error.import_fail'), e.message);
        return;
      }

      this.createPreviewTable(data);

      this.ui.importBtn.erase('title');
      this.ui.importBtn.disabled = false;
      this.ui.fulltextSearchInput.erase('title');
      this.ui.fulltextSearchInput.disabled = false;
      this.ui.fulltextSearchBtn.disabled = false;
      this.ui.filterNavigation.removeClass('disabled');
    },

    createPreviewTable: function(importRes) {
      var table = this.ui.table;
      this.previewTable = new PreviewTable(
        table.empty(),
        this.ui.importMessages.empty(),
        importRes
      );

      // disabled since error rows cant get checked any more
      // this.previewTable.addEvent('dataValidity', function(value) {
      //   this.ui.importBtn.disabled = !value;

      //   if ( !value ) {
      //     this.ui.importBtn.set('title', _lang('import.info.can_not_import_with_errors'));
      //   } else {
      //     this.ui.importBtn.erase('title');
      //   }
      // }.bind(this));

      this.previewTable.addEvent('updatedDataCounter', function(counter) {
        this.filterNav.updateCounter([
          {'name': 'all', 'count': counter.all},
          {'name': 'creations', 'count': counter.creations},
          {'name': 'warnings', 'count': counter.warnings},
          {'name': 'errors', 'count': counter.errors},
          {'name': 'dublicates', 'count': counter.dublicates}
        ]);

        this.ui.importBtn.set('html', counter.selected === null ? _lang('import.do_import') : _lang('import.do_import_rows', {'count': counter.selected}));
        this.ui.importBtn.disabled = !!!counter.selected;

      }.bind(this));

      // this.previewTable.fireDataValidity();
      this.previewTable.fireUpdatedDataCounter();

      this.ui.wizard.hide();
      table.show();
    },

    updateTableFilterClasses: function(filterName) {
      var tableElmt = this.ui.table;
      if ( filterName === 'all' ) {
        tableElmt
          .addClass('creations')
          .addClass('warnings')
          .addClass('errors')
          .addClass('dublicates');

      } else if ( filterName === 'dublicates' ) {
        tableElmt
          .removeClass('creations')
          .removeClass('warnings')
          .removeClass('errors')
          .addClass('dublicates');
      } else if ( filterName === 'errors' ) {
        tableElmt
          .removeClass('creations')
          .removeClass('warnings')
          .removeClass('dublicates')
          .addClass('errors');
      } else if ( filterName === 'warnings' ) {
        tableElmt
          .removeClass('creations')
          .removeClass('dublicates')
          .removeClass('errors')
          .addClass('warnings');
      } else if ( filterName === 'creations' ) {
        tableElmt
          .removeClass('warnings')
          .removeClass('dublicates')
          .removeClass('errors')
          .addClass('creations');
      }
    },

    buildFilterNav: function() {
      return new FilterNav({
        title: _lang('import.filter.title'),
        items: [
          {'name': 'all', 'label': _lang('import.filter.all')},
          {'name': 'creations', 'label': _lang('import.filter.creations'), 'icon': new Element('i', {'class': 'icon-plus m_r-5'})},
          {'name': 'errors', 'label': _lang('import.filter.errors'), 'icon': new Element('i', {'class': 'icon-cancel m_r-5'})},
          {'name': 'warnings', 'label': _lang('import.filter.warnings'), 'icon': new Element('i', {'class': 'icon-bell-alt m_r-5'})},
          {'name': 'dublicates', 'label': _lang('import.filter.dublicates'), 'icon': new Element('i', {'class': 'icon-tags m_r-5'})}
        ]
      });
    },

    template: function(_, d) {
      var box = _('div', '.=p-7',
        _('div', ':=importMessages', '.=').hide(),
        _('div', '.=b-25 bg-W',
          _('div', '.=a-c fb fs-20 p-20 tsd_b-W fc-B4', ':=wizard',
            _('i', '.=icon-download-cloud m_r-10'),
            _lang('import.select_source'),

            _('menu', '.=m_t-10 importSourceMenu',
              _('menuitem', ':=googleBtn',
                _('img', {'src': ASSETS_PATH + 'googlemail-64.png'}),
                _('span', 'Gmail')
              ),

              _('menuitem', ':=excelBtn', {'data-access': 'excel'},
                _('img', {'src': ASSETS_PATH + 'Microsoft_Excel_Logo.png'}),
                _('span', 'Excel')
              ),

              _('menuitem', ':=outlookcsvBtn', {'data-access': 'outlookcsv'},
                _('img', {'src': ASSETS_PATH + 'Microsoft_Outlook_Icon.png'}),
                _('span', 'Outlook Csv')
              ),

              _('menuitem', ':=csvBtn', {'data-access': 'csv'},
                _('img', {'src': ASSETS_PATH + 'csv_file.png'}),
                _('span', 'Csv')
              ),

              _('menuitem', ':=vcardBtn', {'data-access': 'vcard'},
                _('img', {'src': ASSETS_PATH + 'vcard.png'}),
                _('span', 'vCard')
              )
            )

            // _('div', '.=importInfoText',
            //   _lang('import.source_information')
            // )
          ),
          _('div', '.=a-c', ':=table', '.=importTable dublicates warnings errors creations').hide(),
          _('div', '.=a-c', ':=successElmt', '.=importSuccess').hide()
        )
      );

      return _('div',
        _('div', '.=men', {'id': 'men'},
          _('a', '.=men_item', _lang('import.btn.back_contacts')).addEvent('click', function() {
            ZeyOSApi.loadPage({umi: 'contacts'});
          }),
          _('a', '.=men_item', _lang('import.new'), ':=newImport')
        ),

        _('div', {'id': 'sbar', 'style': 'height: 100%;'},
          _('section', {'style': 'height: 100%;'}, ':=filterNavigation',
            d.filterNav
          )
        ),

        _('div', {'id': 'page'},
          _('div', '.=clr-a',
            _('div', '.=att',
              _('input', {'type': 'text', 'placeholder': _lang('import.placeholder.search')}, ':=fulltextSearchInput'),
              _('button', {'type': 'button', 'data-icon': '\ue800'}, ':=fulltextSearchBtn')
            ),
            _(_fcty.Button(_lang('import.do_import')).addClass('fl-r'), ':=importBtn')
          ),

          new gx.zeyos.Groupbox(box, {title: 'Import Contacts'})
              .toElement()
              .removeClass('m_l-10')
              .removeClass('m_r-10')
              .addClass('m_t-10')
        )
      );
    },

    doImportData: function() {
      if ( this.ui.importBtn.disabled ) {
        return;
      }

      var data = this.previewTable.getCompleteImportData();
      var _this = this;
      doRequest({
        'url': PLATFORM_BASE_URL + IMPORT_DATA_URL,
        'method': 'post',
        'data': {
          data: JSON.encode(data)
        },
        'onSuccess': function(res) {
          _this.processImportSuccess(res);
        }
      });
    },

    processImportSuccess: function(res) {
      var data;
      try {
        data = JSON.decode(res);
        if ( !data )
          throw 'Could not decode response: ' + data;

        if ( data.error )
          throw data.error;

      } catch(e) {
        showError(_lang('import.error.import_fail'), e.message);
        return;
      }

      this.filterNav.resetCounter();
      this.ui.fulltextSearchInput.disabled = true;
      this.ui.fulltextSearchBtn.disabled = true;
      this.ui.importBtn.disabled = true;
      this.ui.filterNavigation.addClass('disabled');

      var skippedrows = 0,
        overwrittencount = 0,
        insertcount = 0;

      if ( data.skippedrows )
        skippedrows = data.skippedrows.length;

      if ( data.overwritten )
        overwrittencount = data.overwritten.length;

      if ( data.insert )
        insertcount = data.insert.length;

      var table = new Element('div').adopt(
        new Element('div', {'html': _('import.result.total') + ': ' + data.datacount}),
        new Element('div', {'html': _('import.result.skipped') + ': ' + skippedrows}),
        new Element('div', {'html': _('import.result.overwritten') + ': ' + overwrittencount}),
        new Element('div', {'html': _('import.result.created') + ': ' + insertcount})
      );

      this.ui.table.hide();
      this.ui.wizard.hide();
      this.ui.importMessages
        .empty()
        .adopt(buildFeedMsg('success', 'check', _lang('import.success')))
        .show();
      this.ui.successElmt
        .empty()
        .adopt(table)
        .show();
    },

  });

  var PreviewFormatApi = {
    'percent': function(value) {
      return ZeyOSApi.fmtNum(value) + ' %';
    },

    'constvalue': function(value, meta, field) {
      var entity = meta.entity;
      if ( meta.fields[field].relateto != null ) {
        entity = meta.relations[meta.fields[field].relateto].entity;
        field = meta.fields[field].name;
      }

      return _('constvalues.' + entity + '.' + field + '.' + value );
    }
  };

  var PreviewTable = new Class({
    Implements: Events,

    originDataStartRow: 0,
    dublicates: {},
    skiprows: {},
    rowMessages: {},
    rowsWithError: {},

    meta: null,
    fields: null,
    items: null,

    entity: null,

    fieldsToCols: {},

    headCols: [],
    headColDataStartIndex: 0,

    importIsValid: true,
    importErrorsCount: 0,
    importWarningsCount: 0,
    importDublicatesCount: 0,
    foundUnresolvedCountries: false,

    data: null,

    initialize: function(parent, messagesElmt, data) {
      this.data = data;
      this.originDataStartRow = parseInt(data.datastartrow);
      this.meta = Object.clone(data.meta);
      this.entity = this.meta.entity;
      this.fields = this.meta.fields;
      this.items = Array.clone(data.data);
      this.dublicates = data.dublicates || {};
      this.rowMessages = {};
      if ( data.messages && data.messages.data )
        this.rowMessages = data.messages.data;

      this.buildTable(parent);
      this.fireUpdatedDataCounter(true);
      this.buildMessages(messagesElmt);
    },

    getCompleteImportData: function() {
      return {
        meta: this.data.meta,
        data: this.data.data,
        dublicates: this.dublicates,
        skiprows: this.skiprows,
        relations: this.data.relations
      };
    },

    // fireDataValidity: function() {
    //   this.fireEvent('dataValidity', [this.importIsValid]);
    // },

    fireUpdatedDataCounter: function(all) {
      var selected = null;

      if ( this.tableDiv )
        selected = this.tableDiv.getElements('tr.rowGetImported').length;

      if ( all === true )
        this.doUpdateDataCounter();

      this.fireEvent('updatedDataCounter', [{
        selected: selected,
        all: this.items.length,
        creations: this.importCreationsCount,
        dublicates: this.importDublicatesCount,
        warnings: this.importWarningsCount,
        errors: this.importErrorsCount
      }]);
    },

    doUpdateDataCounter: function() {
      var tablediv = this.tableDiv;
      this.importCreationsCount = tablediv.getElements('tr.create').length;
      this.importDublicatesCount = tablediv.getElements('tr.dublicate').length;
      this.importErrorsCount = tablediv.getElements('tr.error').length;
      this.importWarningsCount = tablediv.getElements('tr.warning').length;
    },

    buildMessages: function(parent) {
      var hasMsg = false;

      if ( this.importErrorsCount > 0 ) {
        parent.adopt(buildFeedMsg('error', 'cancel', _lang('import.info.has_errors')));
        hasMsg = true;
      }

      if ( this.importWarningsCount > 0 ) {
        parent.adopt(buildFeedMsg('warning', 'bell-alt', _lang('import.info.has_warnings')));
        hasMsg = true;
      }

      if ( this.importDublicatesCount > 0 ) {
        parent.adopt(buildFeedMsg('dublicate', 'tags', _lang('import.info.has_dublicates')));
        hasMsg = true;
      }

      if ( this.foundUnresolvedCountries ) {
        parent.adopt(buildFeedMsg('warning', 'bell-alt', _lang('import.warning.unresolved_countries')));
        hasMsg = true;
      }

      if ( hasMsg )
        parent.show();
    },

    buildItemMessages: function(warning) {
      var text = warning;
      var type = 'error';
      if ( warning.message ) {
        text = warning.message;

        if ( warning.meta && warning.meta.type )
          type = warning.meta.type;
      }

      var element = new Element('div', {
        'style': '',
        'class': type,
        'html': '<b>'+_('common.'+type)+'</b> ' + text
      });

      return [type, element];
    },

    getFieldMeta: function(fieldId) {
      return this.fields[fieldId];
    },

    buildTable: function(parent) {
      var tablediv = new Element('div');
      parent.adopt(tablediv);

      var meta = this.meta;
      var items = this.items;

      this.fieldsToCols = {};

      var gData = {
        skiprows: {},
      };

      var headCols = [];

      var switchcheckboxes = new Element('input', {
        'type': 'checkbox',
        'class': 'skipAllCheckbox',
        'checked': true
      });

      headCols.push({
        'label': switchcheckboxes,
        'id': 'skipcheck',
        'filterable': false,
        'width': 14
      });

      headCols.push({
        'label': 'Row',
        'id': 'row',
        'filterable': false
      });

      this.headColDataStartIndex = headCols.length;

      for ( var name in meta.fields ) {
        if ( !meta.fields.hasOwnProperty(name) )
          continue;

        var field = meta.fields[name];
        if ( !field.preview || items[0][name] === undefined )
          continue;

        this.fieldsToCols[name] = headCols.push({
          'label': name,
          'id': name,
          'filterable': false
        }) - 1;
      }

      this.headCols = headCols;

      var table = new gx.zeyos.Table(tablediv, {
        'scroll': false,
        'data': this.items,
        'cols': headCols,
        'structure': this.buildTableRow.bind(this),
        'onAfterRowAdd': this.buildTableRowMessage.bind(this)
      });

      tablediv.addEvent('click', function(event) {
        var tag = event.target.get('tag');
        var target = event.target;

        if ( target.hasClass('skipAllCheckbox') ) {
          tablediv.getElements('tr').each(function(tr) {
            table.fireEvent('switch', [tr, target.checked]);
          });
          this.fireUpdatedDataCounter();
          return;

        }

        var tr = target;
        if ( tag !== 'tr' )
          tr = tr.getParent('tr');

        if ( tr ) {
          table.fireEvent('switch', [tr, undefined, target.hasClass('skipRowCheckbox')]);
          this.fireUpdatedDataCounter();
          return;
        }

        event.preventDefault();
        return;
      }.bind(this));

      table.addEvent('switch', function(tr, value, targetIsCheckboxInput) {
        var checkbox = tr.getElement('.skipRowCheckbox');
        if ( !checkbox || checkbox.disabled )
          return;

        var index = tr.get('data-row-index');
        if ( checkbox ) {
          if ( !targetIsCheckboxInput )
              checkbox.checked = value !== undefined ? value : !checkbox.checked;

          this.changeSwitchRowValue(checkbox.checked, index);

          tr.toggleClass('rowGetImported', checkbox.checked);
        }
      }.bind(this));
      this.tableDiv = tablediv;
      this.table = table;
    },

    changeSwitchRowValue: function(value, index) {
      if ( !value ) {
        this.skiprows[index] = true;
        if ( this.rowHasError(index) === true ) {
          this.importIsValid = true;
        }
      } else {
        delete this.skiprows[index];
        if ( this.rowHasError(index) === true ) {
          this.importIsValid = false;
        }
      }

      // this.fireDataValidity();
    },

    rowHasError: function(index) {
      return this.rowsWithError[index];
    },

    buildTableRow: function(row, index) {
      var cols = [];
      var _this = this;

      cols.push(new Element('input', {
        'type': 'checkbox',
        'class': 'skipRowCheckbox',
        'checked': true
      }));

      cols.push(parseInt(index) + this.originDataStartRow);

      var value, headCol, headCols = this.headCols;

      for ( var i = this.headColDataStartIndex, l = headCols.length; i < l; i++ ) {
        headCol = headCols[i];
        value = row[headCol.id];

        if ( value )
          value = this.buildTableCellValue(value, headCol.id);
        else
          value = '';

        cols.push(value);
      }

      var properties = {
        'data-row-index': index,
        'class': 'rowGetImported'
      };

      if ( this.dublicates[index] !== undefined ) {
        properties.class += ' dublicate';
      } else
        properties.class += ' create';

      return {
        properties: properties,
        row: cols
      };
    },

    buildTableCellValue: function(value, fieldId) {
      var fieldMeta = this.getFieldMeta(fieldId);

      var previewformat = fieldMeta.previewformat;

      if ( !previewformat && fieldMeta.constvalue )
        previewformat = 'constvalue';

      if ( previewformat ) {
        if ( typeof PreviewFormatApi[previewformat] === 'function' )
          value = PreviewFormatApi[previewformat](value, this.meta, fieldId);

        else {
          previewformat = previewformat.charAt(0).toUpperCase() + previewformat.slice(1);

          if ( typeof ZeyOSApi['fmt' + previewformat] === 'function' )
            value = ZeyOSApi['fmt' + previewformat](value);
        }

      }

      return value;
    },

    buildTableRowMessage: function(row, index) {
      row.tr.getChildren().forEach(function(td) {
        var v = td.get('text');
        if ( v && v.length > 15 )
          td.set('title', v);

      });

      var msgData = this.rowMessages[index];
      if ( !msgData )
        return;

      var skipCheckbox;
      var td = new Element('td', {
        'colspan': this.headCols.length - 1
      });

      var type = '';
      var typeIcon = '';
      for ( var i = 0, l = msgData.length; i < l; i++ ) {
        var result = this.buildItemMessages(msgData[i]);
        td.adopt(result[1]);

        // error is the most important highlight, do not overwrite with other.
        if ( type === '' || type != 'error' ) {
          type = result[0];
        }
      }

      if ( type == 'error' ) {
        typeIcon = '<i class="icon-cancel" />';
      }

      else if ( type == 'warning' ) {
        typeIcon = '<i class="icon-bell-alt" />';
      }

      row.tr.addClass(type);

      if ( type === 'error' ) {
        row.tr
            .removeClass('create')
            .removeClass('rowGetImported');

        // by default skip all rows which has error
        this.rowsWithError[index] = true;
        this.skiprows[index] = true;
        skipCheckbox = row.tr.getElement('.skipRowCheckbox');
        skipCheckbox.checked = false;
        skipCheckbox.disabled = true;
      }

      var tr = new Element('tr', {
        'class': 'tbl_row a-c message'
      });
      var tbody = row.tr.getParent().adopt(tr);
      new Element('td', {'html': typeIcon}).inject(tr);
      td.inject(tr);

      if ( this.entity === 'contacts' && this.fieldsToCols.country ) {
        this.makePreviewDataEditable(row, index);
      }

    },

    filterFullText: function(text) {
      var rows = this.tableDiv;
      if ( !rows ) return;

      rows = rows.getElement('tbody');
      if ( !rows ) return;

      rows = rows.getElements('tr');

      if ( text === false ) {
        rows.removeClass('searchTxtNotFound');
        return;
      }

      text = text.toLowerCase();
      var row;
      for ( var i = 0, l = rows.length; i < l; i++ ) {
        row = rows[i];

        row.toggleClass('searchTxtNotFound', row.get('text').toLowerCase().indexOf(text) === -1);
      }

        // searchTxtNotFound
    },

    makePreviewDataEditable: function(row, index) {
      // currently we care for country only
      var msgData = this.rowMessages[index];
      if ( !msgData )
        return;

      // Search for an country error
      var data, foundData = false;
      for ( var i = 0, l = msgData.length; i < l; i++ ) {
        data = msgData[i];
        if ( data.meta && data.meta.fields && data.meta.fields.country) {
          foundData = true;
          break;
        }
      }

      if ( !foundData )
        return;

      this.foundUnresolvedCountries = true;

      var countryTdIndex = this.fieldsToCols.country;
      var countryTd = row.tr.getChildren()[countryTdIndex];
      var currentCountry = countryTd.get('html');
      new Element('i', {'class': 'icon-pencil m_r-10 colorWarning cursorPointer'})
        .addEvent('click', function(event) {
          new EditCountryPopup(
            this.table,
            row,
            currentCountry,
            this.data,
            this.tableDiv,
            countryTdIndex,
            this.rowMessages
          ).addEvent('changed', function() {
            this.fireUpdatedDataCounter(true);
          }.bind(this));

          event.stopPropagation();

        }.bind(this))
        .inject(countryTd, 'top');
      // countryTd.adopt(this.buildCountrySelect());
    }

  });

  var FilterNav = new Class({
    Extends: gx.ui.Container,

    options: {
      'title': 'Filter',
      'items': [
        {'name': '', 'label': 'text', 'icon': 'HTMLElement'}
      ]
    },

    filter: {},

    initialize: function(options) {
      this.parent(new Element('div.nav'), options);

      this.build(this._ui.root, this.options.items);
    },

    build: function(parent, items) {
      parent.adopt(new Element('p', {'html': this.options.title}));
      var _this = this;

      var clickItem = function() {
        _this._ui.root.getElements('div.nav_item.act')
          .removeClass('act');

        this.addClass('act');
        _this.fireEvent('clickedFilter', [this.get('data-name')]);
      };

      var item, elmt, first = true;
      for (var i = 0, l = items.length; i < l; i++ ) {
        item = items[i];
        elmt = new Element('div', {
          'data-name': item.name,
          'class': 'nav_item ' + (first ? 'act' : '')
        });

        first = false;

        if ( item.icon )
          elmt.adopt(item.icon);

        if ( item.label )
          elmt.appendText(item.label);

        elmt.addEvent('click', clickItem);

        parent.adopt(elmt);

        this.filter[item.name] = elmt;
      }
    },

    updateCounter: function(filters) {
      var item, filter;
      for (var i = 0, l = filters.length; i < l; i++ ) {
        item = filters[i];
        filter = this.filter[item.name];
        if ( !filter )
          continue;

        filter.set('data-count', item.count);
      }
    },

    selectFilter: function(name) {
      var filter = this.filter[name];
      if ( filter )
        filter.fireEvent('click');
    },

    resetCounter: function() {
      var name;
      for ( name in this.filter ) {
        if ( !this.filter.hasOwnProperty(name) )
          continue;

        this.filter[name].erase('data-count');
      }
    }

  });

  var EditCountryPopup = new Class({
    Implements: Events,

    countries: null,
    sameValueItems: [],
    initialize: function(table, row, current_value, data, tableDiv, countryTdIndex, rowMessages) {
      this.table = table;
      this.select = this.buildCountrySelect();

      this.findAllItemsWithValue(data.data, current_value);

      this.ui = {};

      content = _tpl.render(this.ui, {
        current_value: current_value,
        select: this.select.toElement(),
        itemsCount: this.sameValueItems.length
      }, this.template);

      if ( this.sameValueItems.length <= 1 ) {
        this.ui.changeAllWrapper.hide();
        this.ui.changeAllCheckbox.checked = false;
      }

      this.ui.cancelBtn.addEvent('click', function() {
        this.popup.hide();
      }.bind(this));


      this.ui.okBtn.addEvent('click', function() {
        this.doChange(row, data.data, tableDiv, countryTdIndex, rowMessages);
      }.bind(this));

      this.popup = showPop(_('import.title.edit_country_popup'), content);

      var _this = this;
      var origHide = this.popup.hide.bind(this.popup);
      this.popup.hide = function() {
        origHide();
        _this.destroy();
      };
    },

    findAllItemsWithValue: function(items, value) {
      for ( var i = 0, l = items.length; i < l; i++ ) {
        if ( items[i].country === value ) {
          this.sameValueItems.push(i);
        }
      }
    },

    doChange: function(row, items, tableDiv, countryTdIndex, rowMessages) {
      var code = this.select.getId();
      if ( !code )
        code = '';

      if ( !this.ui.changeAllCheckbox.checked ) {
        this.updateItem(code, items, row.tr.get('data-row-index'), row.tr, countryTdIndex, rowMessages);
      } else {
        var tr;
        for ( var i = 0, l = this.sameValueItems.length; i < l; i++ ) {
          tr = tableDiv.getElement('tr[data-row-index='+this.sameValueItems[i]+']');
          this.updateItem(code, items, this.sameValueItems[i], tr, countryTdIndex, rowMessages);
        }
      }

      this.fireEvent('changed');

      this.popup.hide();
    },

    updateItem: function(code, items, index, tr, countryTdIndex, rowMessages) {
      var item = items[index];
      item.country = code;
      tr.getChildren()[countryTdIndex].set('html', code);

      // Check if the country was the only error for this row and remove the error.
      var msgData = rowMessages[index];
      if ( !msgData || msgData.length > 1 )
        return;

      var data = msgData[0];
      if ( data.meta && data.meta.fields && data.meta.fields.country && Object.getLength(data.meta.fields) === 1 ) {
        tr.removeClass('error');
        if ( !tr.hasClass('dublicate') )
          tr.addClass('create');

        var checkbox = tr.getElement('.skipRowCheckbox');
        checkbox.disabled = false;
        this.table.fireEvent('switch', [tr, true]);

        tr.getNext().destroy();
      }
    },

    template: function(_, d) {
      return _('div',
        _('i', '.=icon-flag a-t p_r-20 d-tc ', {'style': 'font-size:60px;'}),
        _('form', '.=d-tc fileUploadForm',
          _('p', '.=fs-20', _lang('import.title.edit_country_popup')),
          _('div',
            _lang('import.edit_country.info_text'),
            _('hr'),

            _('div',
              _('p', _lang('import.edit_country.current_value')),
              _('span', d.current_value)
            ),

            _('div', ':=changeAllWrapper', '.=m_t-10',
              _('p', _lang('import.edit_country.more_same_value_text', {
                count: d.itemsCount,
                value: d.current_value
              })),
              _('input', {'type': 'checkbox', 'checked': true, 'id': 'editCountryChangeAll'}, ':=changeAllCheckbox', '.=a-m m_r-10'),
              _('label', _lang('import.edit_country.more_same_value_check'), {'for': 'editCountryChangeAll'})
            ),

            _('div', '.=m_t-10',
              _('p', _lang('import.edit_country.country')),
              d.select
            )

          )
        ),
        _('div', '.=clr-a m_t-10',
          _('button', _lang('action.abort'), '.=fl-l', ':=cancelBtn'),
          _('button', _lang('action.ok'), '.=fl-r em', ':=okBtn')
        )
      );
    },

    buildCountrySelect: function() {
      if ( !this.countries ) {
        var countries = _('countries');
        var code, arr = [];
        for ( code in countries ) {
          if ( !countries.hasOwnProperty(code) )
            continue;

          arr.push({'ID': code, 'name': countries[code]});
        }

        this.countries = arr;
      }

      return new gx.zeyos.SelectFilter(new Element('div', {'style': 'width:150px;'}), {
        'data': Array.clone(this.countries)
      });
    },

    destroy: function() {
      this.popup._popup._display.blend.destroy();
      $(this.popup._popup._display.content).destroy();
    }

  });

  var FileUploadPopup = new Class({
    Implements: [Events],

    Binds: ['onChangeFileInput'],

    allowedFileTypes: null,

    initialize: function(fileType) {
      this.ui = {};

      var content;

      if ( fileType === 'vcard' ) {
        content = _tpl.render(this.ui, {}, this.templateVcardFileInput);
        this.allowedFileTypes = ['vcf'];
      } else if ( fileType === 'outlookcsv' ) {
        content = _tpl.render(this.ui, {}, this.templateOutlookCsvFileInput);
        this.allowedFileTypes = ['csv'];

      } else {
        content = _tpl.render(this.ui, {
          accept: fileType === 'csv' ? '.csv' : '.xls,.xlsx',
          template: fileType === 'csv' ? 'csv' : 'xlsx',
        }, this.templateFileInput);

        this.allowedFileTypes = 'csv' ? ['csv'] : ['xls', 'xlsx'];
      }

      this.ui.importFile.addEvent('change', this.onChangeFileInput);
      this.popup = showPop(_('import.title.file_popup'), content);

      var _this = this;
      var origHide = this.popup.hide.bind(this.popup);
      this.popup.hide = function() {
        origHide();
        _this.destroy();
      };
    },

    templateVcardFileInput: function(_, d) {
      return _('div',
        _('i', '.=icon-download-cloud a-t p_r-20 d-tc ', {'style': 'font-size:60px;'}),
        _('form', '.=d-tc fileUploadForm',
          _('p', '.=fs-20', _lang('import.title.vcard')),
          _('div',
            _lang('import.select_vcard_file_info'),
            _('hr'),

            _('div', '.=upload m_t-10',
              _lang('import.select_file'),
              _('input', {'type': 'file', 'name': 'importFile', 'accept': '.vcf'}, ':=importFile')
            )
          )
        )
      );
    },

    templateOutlookCsvFileInput: function(_, d) {
      return _('div',
        _('i', '.=icon-download-cloud a-t p_r-20 d-tc ', {'style': 'font-size:60px;'}),
        _('form', '.=d-tc fileUploadForm',
          _('p', '.=fs-20', _lang('import.title.outlookcsv')),
          _('div',
            _lang('import.select_outlookcsv_file_info'),
            _('hr'),

            _('div', '.=upload m_t-10',
              _lang('import.select_file'),
              _('input', {'type': 'file', 'name': 'importFile', 'accept': '.csv'}, ':=importFile')
            )
          )
        )
      );
    },

    templateFileInput: function(_, d) {
      return _('div',
        _('i', '.=icon-download-cloud a-t p_r-20 d-tc ', {'style': 'font-size:60px;'}),
        _('form', '.=d-tc fileUploadForm',
          _('p', '.=fs-20', _lang('import.select_file')),
          _('div',
            _lang('import.select_file_info'),
            _('hr'),

            _('div',
              _('input', {'type': 'radio', 'name': 'contacttype', 'checked': true, 'id': 'contactTypePerson'}, ':=contactTypePerson', '.=a-m m_r-10'),
              _('label', _lang('import.types.contacts.1'), '.=fs-20 a-m', {'for': 'contactTypePerson'})
            ),

            _('div',
              _('input', {'type': 'radio', 'name': 'contacttype', 'id': 'contactTypeCompany'}, ':=contactTypeCompany', '.=a-m m_r-10'),
              _('label', _lang('import.types.contacts.0'), '.=fs-20 a-m', {'for': 'contactTypeCompany'})
            ),

            _('div',
              _('input', {'type': 'radio', 'name': 'contacttype', 'id': 'contactTypeMixed'}, ':=contactTypeMixed', '.=a-m m_r-10'),
              _('label', _lang('import.types.contacts.2'), '.=fs-20 a-m', {'for': 'contactTypeMixed'})
            ),

            _('hr'),

            _('div', {'style': 'width: 300px;'},
              _('span', _lang('import.info.template1')),
              _('a', {'href': ASSETS_PATH + 'template.' + d.template, 'target': '_blank'}, '.=linkBlue',
                _('i', '.=icon-download'),
                ' ' + _lang('import.info.template2')
              ),
              _('span', _lang('import.info.template3')),
              _('br'),
              _('span', _lang('import.info.template4'))
            ),

            _('hr'),

            _('div', '.=upload m_t-10',
              _lang('import.select_file'),
              _('input', {'type': 'file', 'name': 'importFile', 'accept': d.accept}, ':=importFile')
            )
          )
        )
      );
    },

    onChangeFileInput: function() {
      var file = this.ui.importFile.get('value');
      if ( !file )
        return;

      var allowed = this.allowedFileTypes;
      var split = file.split('.');
      var ext = split.pop().toLowerCase();

      if ( !ext || !allowed.contains(ext) ) {
        showError(_lang('common.error'), _('import.error.invalid_file_type', {extensions: allowed.join(' | ')}));
        return;
      }

      var type = null;
      if ( this.ui.contactTypePerson ) {
        if ( this.ui.contactTypePerson.checked )
          type = 1;
        else if ( this.ui.contactTypeCompany.checked )
          type = 0;
      }

      this.fireEvent('fileSelected', [this.ui.importFile, type]);
    },

    destroy: function() {
      this.popup._popup._display.blend.destroy();
      $(this.popup._popup._display.content).destroy();
    }

  });

  var googleOAuth = function(apiKey, clientId, scopes, success, failure) {
    gapi.client.setApiKey(apiKey);
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: false
    }, function(authResult) {
      if (authResult && !authResult.error) {
        success(gapi.auth.getToken());
      } else if ( typeof failure === 'function' ) {
        failure(authResult.error);
      }

    });
  };

})();
