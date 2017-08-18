Deep fries your pics. Serve with laundry sauce.

live @ http://deepfriedmemes.com

tl;dr on how it works:
  - All processing done locally in the browser.
  - Filters applied by [CamanJS](http://camanjs.com/)
  - JPEG crushing done by drawing image to canvas, converting canvas to a jpeg data url, and repeating through recursion (because we proceed to the next step through the `img.onload` callback)
  
  
I'm probably not going to add bulging / emojis because it seems kinda out of scope. But if you know a clean / fast way to do it, submit a PR :D
