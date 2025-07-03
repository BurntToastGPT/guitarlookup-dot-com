# Gibson Serial Decoder Update Summary

## Overview

Updated the GuitarLookup serial decoder to work with the new Gibson serial number rules JSON format that uses a "placeholder pattern" system (e.g., "A000000 – Letter + 6 digits").

## Key Changes Made

### 1. Pattern Matching System (src/utils/serialDecoder.js)

#### New Functions Added:

- **`serialToPlaceholderPattern(serial)`**: Converts user input like "B123456" to placeholder patterns
- **`matchesPattern(serial, patternDescription)`**: Matches serials against pattern descriptions from JSON
- **`matchesPatternSingle(serial, pattern)`**: Handles individual pattern matching logic

#### Pattern Recognition Examples:

- "CS12345" → matches "CSYRRRR – 'CS' prefix, year, and ranking"
- "82365123" → matches "YDDDYRRR – 8-digit impressed number"
- "123456" → matches "XXXXXX – 6-digit number"

### 2. Enhanced Decoding Logic

#### Updated `decodeGibsonSerial()`:

- Now properly parses the new JSON structure with pattern_description field
- Skips header/category entries (those with "nan" values)
- Extracts pattern from description before the "–" separator
- Supports all pattern types including ranges (e.g., "000001-099999")

#### New `parseGibsonSerialFormat()`:

- Provides detailed decoding for specific formats:
  - 8-digit YDDDYRRR (1977-2005)
  - 9-digit YDDDYBRRR (2005-2014)
  - 10-digit YYMMDDFFFF (2014-Present)
  - Custom Shop patterns
  - Les Paul Classic patterns

### 3. Clarifying Questions Support

#### Features:

- Dynamically displays questions from the JSON `clarifying_questions` array
- Skips "nan" questions
- Generates contextual answer options based on question content
- Supports multiple follow-up questions per rule

#### Example Flow:

1. User enters "123456"
2. System asks: "Is the serial number impressed (stamped) into the wood...?"
3. Based on answer, may ask follow-up about "MADE IN USA" stamp
4. Uses answers to determine exact year range

### 4. Ambiguity Notes Display

#### Updated Results Page (src/pages/Results.jsx):

- Added display for `ambiguityNotes` field
- Shows warning icon (⚠️) for important ambiguity information
- Prioritizes ambiguity notes over generic uncertainty messages

#### Example:

For 1960s 6-digit serials with HIGH AMBIGUITY, displays:
"Serial number ranges were heavily reused across multiple years. The number alone is not a reliable indicator of the year. Dating requires checking other features."

### 5. Enhanced Error Handling

- Better detection of malformed patterns
- Graceful handling of "nan" values in JSON
- Clear error messages when serial format isn't recognized

## Pattern Types Supported

1. **Fixed Digit Patterns**:

   - XXXX, XXXXX, XXXXXX (4-6 digit numbers)
   - YDDDYRRR, YDDDYBRRR (date-encoded)
   - YYMMDDFFFF (modern format)

2. **Letter Prefix/Suffix Patterns**:

   - A_XXXX (letter with space)
   - XXXXA (letter suffix)
   - CS/PF prefixes

3. **Range Patterns**:

   - "000001-099999" (numeric ranges)

4. **Complex Patterns**:
   - (A_or_B)-MYRRR
   - S(S)-YYMM-RR
   - Custom variations

## Testing

See `test_decoder_examples.md` for example serial numbers and expected behavior.

## Benefits

1. **Maintainability**: New patterns can be added to JSON without code changes
2. **Flexibility**: Supports complex pattern variations and edge cases
3. **User Experience**: Clear clarifying questions guide users to accurate results
4. **Transparency**: Shows ambiguity notes and confidence levels
5. **Extensibility**: Pattern system can be adapted for other brands

## Next Steps

1. Test with various real Gibson serial numbers
2. Add similar pattern support for other brands (Fender, Martin, etc.)
3. Consider adding visual pattern guides in the UI
4. Implement analytics to track which patterns are most commonly searched
