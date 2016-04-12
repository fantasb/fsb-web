# fsb-web




### To Do
- Review + finish implementing layout + libs:
	- layout.hbs
		- Browser-check head
		- Universal Bits (head, scripts, nav, footer, etc)
	- SASS
	- HB Helpers
- Fix gulp watch for default development user
	- Not picking up partials?
- Configure winston to use `log/`
- Style ace
	- ace.pop default bar color
	- ace.* font-family?
- Compress libs.css
- Deprecate bower if not using
	- package.json / bower.json / etc
- Finish metatags middleware refactor
	- Old method overcomplicated
- Create + re-implement + test favico logic
- Refactor `app/cache.js` as helper
	- If needed at all. Might be best to remove from code completely and one-off
- Refactor handlebars/helpers.js to stop passing args as refs and just return the helpers
- Deprecate `app/helpers/waiter.js` - is an antipattern
	- Solve `app.locals.fullDomain` situation first and test `util.absolutifyUrl` in a template
- Streamline `routes-provider.js`
	- See "@todo"s in file
- Refactor routing (use Express 4.x)
	- [Refactor Routes For Scalingz](https://www.reddit.com/r/node/comments/2c3psn/expressjs_v3_or_v4_as_a_good_starting_point/)
- Finish translating useful helpers
- Implement React to replace Handlebars
	- Not in v0 in case pressed for time and stuck with proto for awhile; would need to render React views server side for SEO



