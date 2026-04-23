This file describes how the search feature will be structured. 

selecting search will open a modal. 

The modal will feature an input where users can type their search and a div below will render the results.

minimum query length should be 3 characers. 

300 ms debounce.

The search should return Stacks, Notebooks, and Notes (in that order) that include the search term in their title.

When there is a tie in search results, order most recently created first

The search should also return notes that include the search term in their content. 

title matching results should be ranked above note content matching results. 

clicking any of the results should navigate directly to that stack, notebook, or note. 

When selecting a stack from the results, automatically select the first notebook and first note within the first notebook. 