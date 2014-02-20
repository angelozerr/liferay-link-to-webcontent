AUI().use('node', function(A) {
  (function() {

    var DATA_LIFERAY = 'data-liferay-';

    if (Liferay.on) {
      // Liferay 6.2
      Liferay.on('portletReady', function(event) {
        onPortletReady(event.portlet, event.portletId);
      });
    } else if (Liferay.bind) {
      // < Liferay 6.2
      Liferay.bind('portletReady', function(event, data) {
        onPortletReady(data.portlet, data.portletId);
      });
    }

    function onPortletReady(portlet, portletId) {
      // Add onclick on HTML a of the given portlet
      portlet.delegate('click', function(event) {
        var a = event.currentTarget, href = a.attr('href');
        if (!href || href.charAt(href.length - 1) === '#') {
          // loop for each attributes
          // and collect attribute
          // which starts with
          // data-lifreay-*
          var liferayAttributes = null;
          var attributes = a.getDOM().attributes;
          for (var i = 0; i < attributes.length; i++) {
            var attr = attributes.item(i), name = attr.name;
            if (name.slice(0, DATA_LIFERAY.length) == DATA_LIFERAY) {
              if (!liferayAttributes)
                liferayAttributes = {};
              liferayAttributes[name.substring(DATA_LIFERAY.length, name.length).toLowerCase()] = attr.value;
            }
          }
          if (liferayAttributes) {
            // create render url
            display(portletId, liferayAttributes);
          }
        }
      }, 'a');
    };

    function display(portletId, attributes) {
      var renderURL = Liferay.PortletURL.createRenderURL();
      renderURL.setPortletId(portletId);
      renderURL.setPortletMode("view");
      renderURL.setWindowState("normal");
      var plid = null, plfriendlyURL = null, groupId = null;
      for ( var name in attributes) {
        switch (name) {
        case 'plid':
          plid = attributes[name];
          break;
        case 'plfriendlyurl':
          plfriendlyURL = attributes[name];
          break;
        case 'groupid':
          groupId = attributes[name];
          break;
        default:
          var value = attributes[name];
          if (name === 'articleid')
            name = 'articleId';
          renderURL.setParameter(name, value);
        }
      }

      if (plid || plfriendlyURL) {
        displayInPage(renderURL, plid, plfriendlyURL, groupId);
      } else {
        window.location = renderURL.toString();
      }
    }

    function displayInPage(renderURL, plid, plfriendlyURL, groupId) {
      if (!groupId) {
        groupId = Liferay.ThemeDisplay.getSiteGroupId();
      }
      Liferay.Service('/layout/get-layouts', {
        groupId : groupId,
        privateLayout : false,
      }, function(layouts) {
        var layout = findLayout(layouts, plid, plfriendlyURL);
        if (layout) {
          var portletId = getPortletIdFromLayout(layout);
          if (!portletId) {
            alert('No portlet!');
          } else {
            renderURL.setPortletId(portletId);
            renderURL.setPlid(layout.plid);
            window.location = renderURL.toString();
          }
        }
      });

    }

    function findLayout(layouts, plid, friendlyURL) {
      for (var i = 0; i < layouts.length; i++) {
        var layout = layouts[i];
        if (layout.plid === plid || layout.friendlyURL === friendlyURL) {
          return layout;
        }
      }
    }

    function getPortletIdFromLayout(layout) {
      var typeSettings = layout.typeSettings.split("\n");
      for (var i = 0; i < typeSettings.length; i++) {
        var line = typeSettings[i];
        var index = line.indexOf('56_INSTANCE');
        if (index != -1) {
          line = line.substring(index, line.length);
          index = line.indexOf(',');
          if (index != -1) {
            line = line.substring(0, index);
          }
          return line;
        }
      }
    }

  })();
});