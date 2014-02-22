AUI().use('node', function(A) {
  (function() {

    var DATA_LIFERAY = 'data-liferay-';
    var ASSET_PUBLISHER_PORTLETID = '101_INSTANCE';

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
      var assetPublisher = isAssetPublisher(portletId);
      var renderURL = Liferay.PortletURL.createRenderURL();
      renderURL.setPortletId(portletId);
      renderURL.setPortletMode("view");
      renderURL.setWindowState("normal");
      var plid = null, plfriendlyURL = null, groupId = null, articleId = null, urlTitle = null, assetEntryId = null;
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
        case 'articleid':          
          articleId = attributes[name];
          break;
        case 'urltitle':          
          urlTitle = attributes[name];
          break;
        case 'assetentryid':          
          assetEntryId = attributes[name];
          break;          
        default:
          renderURL.setParameter(name, value);
        }
      }
      
      if (assetPublisher) {
        // "Asset Publisher" portlet : urlTitle or assetEntryId is required
        if (urlTitle) {
          renderURL.setParameter('urlTitle', urlTitle);
        } else if (assetEntryId) {
          renderURL.setParameter('assetEntryId', assetEntryId);
        } else {
          alert('Cannot display the link, it requires data-liferay-urlTitle or data-liferay-assetEntryId');
          return;
        }
        // see parameters at ROOT\html\portlet\asset_publisher\view_content.jsp
        renderURL.setParameter('type', 'content');
        renderURL.setParameter('struts_action', '"/asset_publisher/view_content');        
      } else {
        // "Web Content Display" portlet : articleId is required
        if (articleId) {
          
        } else {
          alert('Cannot display the link, it requires data-liferay-articleId');
          return;
        }        
      }
      
      if (plid || plfriendlyURL) {
        displayInPage(renderURL, plid, plfriendlyURL, groupId);
      } else {
        window.location = renderURL.toString();
      }
    }

    function isAssetPublisher(portletId) {
      return portletId.slice(0, ASSET_PUBLISHER_PORTLETID.length) == ASSET_PUBLISHER_PORTLETID;
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