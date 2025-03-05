import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable,BehaviorSubject  } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

// Setup headers with basic authorization
const options = {
  headers: new HttpHeaders({
    Authorization: "Basic " + btoa(environment.phpAuthUser + ':' + environment.phpAuthPassword),
  }),
};

@Injectable({
  providedIn: 'root',
})
export class HelpRequestService {
  private unreadMessagesSubject = new BehaviorSubject<number>(0); // Start with 0 unread messages
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Help Topics
  createHelpTopic(data: any): Observable<any> {
    return this.http.post(environment.apiBaseUrl + 'help-requests/topics', data, options).pipe(
      tap(response => console.log('Help Topic Created:', response))
    );
  }

  // getHelpTopics(userId?: number): Observable<any> {
  //   const params = userId ? `?user_id=${userId}` : '';
  //   return this.http.get(environment.apiBaseUrl + 'help-requests/topics' + params, options).pipe(
  //     tap(response => console.log('Help Topics Fetched:', response))
  //   );
  // }

  getHelpTopics(userId?: number): Observable<any[]> {
    const params = userId ? `?user_id=${userId}` : '';
    return this.http.get<any[]>(environment.apiBaseUrl + 'help-requests/topics' + params, options).pipe(
      tap(response => console.log('Help Topics Fetched:', response)),
      switchMap((topics: any[]) => {
        const topicIds = topics.map((topic: any) => topic.id);  // Collect all topic IDs
        return this.getHelpConversationsForTopics(topicIds).pipe(
          map((conversations: any[]) => {
            // Add conversations to their respective topics
            return topics.map(topic => ({
              ...topic,  // Keep the original topic data
              conversations: conversations.filter(conversation => conversation.topic_id === topic.id), // Filter conversations by topic ID
            }));
          })
        );
      })
    );
  }
  getHelpConversationsForTopics(topicIds: number[]): Observable<any[]> {
    const params = topicIds ? `?topic_ids=${topicIds.join(',')}` : '';
    return this.http.get<any[]>(environment.apiBaseUrl + 'help-requests/conversations' + params, options).pipe(
      tap(response => console.log('Help Conversations Fetched:', response))
    );
  }


  updateHelpTopic(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBaseUrl + `help-requests/topics/${id}`, data, options).pipe(
      tap(response => console.log('Help Topic Updated:', response))
    );
  }

  deleteHelpTopic(id: number): Observable<any> {
    return this.http.delete(environment.apiBaseUrl + `help-requests/topics/${id}`, options).pipe(
      tap(response => console.log('Help Topic Deleted:', response))
    );
  }

  // Help Conversations
  createHelpConversation(data: any): Observable<any> {
    return this.http.post(environment.apiBaseUrl + 'help-requests/conversations', data, options).pipe(
      tap(response => console.log('Help Conversation Created:', response))
    );
  }

  // getHelpConversations(topicId?: number): Observable<any> {
  //   const params = topicId ? `?topic_id=${topicId}` : '';
  //   return this.http.get(environment.apiBaseUrl + 'help-requests/conversations' + params, options).pipe(
  //     tap(response => console.log('Help Conversations Fetched:', response))
  //   );
  // }
  getHelpConversations(topicIds?: number[]): Observable<any> {
    // If topicIds is provided, pass it as a query parameter, else leave it empty
    const params = topicIds && topicIds.length > 0 ? `?topic_ids=${topicIds.join(',')}` : '';

    return this.http.get(environment.apiBaseUrl + 'help-requests/conversations' + params, options).pipe(
      tap(response => console.log('Help Conversations Fetched:', response))
    );
  }


  updateHelpConversation(id: number, data: any): Observable<any> {
    return this.http.put(environment.apiBaseUrl + `help-requests/conversations/${id}`, data, options).pipe(
      tap(response => console.log('Help Conversation Updated:', response))
    );
  }

  deleteHelpConversation(id: number): Observable<any> {
    return this.http.delete(environment.apiBaseUrl + `help-requests/conversations/${id}`, options).pipe(
      tap(response => console.log('Help Conversation Deleted:', response))
    );
  }

  markConversationAsRead(topicId: number): Observable<any> {
    return this.http.post(environment.apiBaseUrl + `help-requests/conversations/${topicId}/mark-as-read`,[], options).pipe(
      tap(response => console.log(' Conversation read:', response))
    );
  }


}
