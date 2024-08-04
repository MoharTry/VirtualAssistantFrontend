export function speech_to_text(onResult, onError) {
  if (!('webkitSpeechRecognition' in window)) {
    onError('Speech recognition not supported');
    return null;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US'; // Set this to your preferred language

  let finalTranscript = '';
  let timeout;

  const stopRecognition = () => {
    if (recognition) {
      recognition.stop();
      clearTimeout(timeout);
    }
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    onResult(finalTranscript, interimTranscript);

    // Reset timeout every time a result is received
    clearTimeout(timeout);
    timeout = setTimeout(stopRecognition, 3000); // 3 seconds of inactivity stops recognition
  };

  recognition.onerror = (event) => {
    onError('Error occurred in recognition: ' + event.error);
    stopRecognition(); // Ensure recognition stops on error
  };

  recognition.onend = () => {
    onResult(finalTranscript, '');
    clearTimeout(timeout);
  };

  return {
    start: () => {
      finalTranscript = '';
      recognition.start();
    },
    stop: stopRecognition
  };
}