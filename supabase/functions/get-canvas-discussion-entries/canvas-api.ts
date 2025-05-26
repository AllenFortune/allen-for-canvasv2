
export async function fetchDiscussionView(
  canvasInstanceUrl: string,
  canvasAccessToken: string,
  courseId: string,
  discussionId: string
) {
  const viewUrl = `${canvasInstanceUrl}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/view`;
  
  console.log(`Making Canvas API request to: ${viewUrl}`);

  const response = await fetch(viewUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${canvasAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Canvas API error: ${response.status} - ${await response.text()}`);
    return null;
  }

  return await response.json();
}

export async function fetchDiscussionEntries(
  canvasInstanceUrl: string,
  canvasAccessToken: string,
  courseId: string,
  discussionId: string
) {
  const entriesUrl = `${canvasInstanceUrl}/api/v1/courses/${courseId}/discussion_topics/${discussionId}/entries?include[]=user&per_page=100`;
  console.log(`Falling back to entries endpoint: ${entriesUrl}`);
  
  const entriesResponse = await fetch(entriesUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${canvasAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!entriesResponse.ok) {
    const errorText = await entriesResponse.text();
    console.error(`Canvas API entries error: ${entriesResponse.status} - ${errorText}`);
    throw new Error(`Canvas API error: ${entriesResponse.status}`);
  }

  return await entriesResponse.json();
}
