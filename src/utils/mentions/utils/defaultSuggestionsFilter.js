// Get the first 5 suggestions that match

const defaultSuggestionsFilter = (
  searchValue,
  suggestions,
  trigger
) => {
  const value = searchValue.toLowerCase();
  const triggerSuggestions =
    trigger && !Array.isArray(suggestions)
      ? suggestions[trigger]
      : suggestions;
  const filteredSuggestions = triggerSuggestions.filter(
    (suggestion) => !value || suggestion.name.toLowerCase().indexOf(value) > -1
  );
  const length =
    filteredSuggestions.length < 5 ? filteredSuggestions.length : 5;
  return filteredSuggestions.slice(0, length);
};

export default defaultSuggestionsFilter;
