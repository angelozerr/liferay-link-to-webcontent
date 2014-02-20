# What is Liferay Link To WebContent?

"Liferay Link To WebContent" provides the capability to write easily your HTML link inside a WebContent to another WebContent with this syntax : 

	&lt;a href="#" data-liferay-articleid="13502" &gt;link to WebContent2&lt;/a&gt;
	
This syntax avoids :

 * setting the portlet name in the URL (Liferay or Friendly) of the referenced WebContent (Liferay or Friendly) URL.
 * or configuring Canonical URL for the referenced WebContent.
 * displaying the the referenced WebContent in the same portlet than the WebContent which has a link to this referenced WebContent.

# How it works?

The [link-to-webcontent-hook](https://github.com/angelozerr/liferay-link-to-webcontent/tree/master/link-to-webcontent-hook) project is an Hook which insert in the whole pages of the Liferay Portal the 
javascript [link-to-webcontent.js](https://github.com/angelozerr/liferay-link-to-webcontent/blob/master/link-to-webcontent-hook/docroot/META-INF/custom_jsps/html/js/link-to-webcontent.js).

This Javascript add event for HTML a and check if there is some data-liferay-* attributes. In this case it uses the Liferay Javascript API 

	&lt;a href="#" data-liferay-articleid="13502" &gt;link to WebContent2&lt;/a&gt;

to create a Liferay URL and dispatch it to the linked WebContent by displaying it in the origin portlet.

	var renderURL = Liferay.PortletURL.createRenderURL();

For the moment, it works only with "Web Content Display" portlet.

# Usage

Imagine you have a WebContent1 displayed in a "Web Content Display" portlet which belongs to Page2. This WebContent1 has a link to WebContent2 : 

![WebContent1 link to WebContent2](https://github.com/angelozerr/liferay-link-to-webcontent/wiki/images/WebContent1InPage2.png)

When "link to WebContent2" link is clicked, the portlet is refreshed with the content of the WebContent2 : 

![WebContent2](https://github.com/angelozerr/liferay-link-to-webcontent/wiki/images/WebContent2InPage2.png)
