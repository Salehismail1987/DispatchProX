import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { environment } from 'src/environments/environment';
import { HelpRequestService } from 'src/app/services/help-request.service';

declare var $: any;
@Component({
  selector: 'app-dashboard-top-header',
  templateUrl: './dashboard-top-header.component.html',
  styleUrls: ['./dashboard-top-header.component.css']
})
export class DashboardTopHeaderComponent implements OnInit {
  loggedinUser : any = {};

  @Input('current_page') current_page:string = '';

  screen:string = '';
  unreadMessages: number = 0;
  help_topics: any[] = [];  // Array to store the fetched help topics
  open_conversation: any = null; // Track the currently opened conversation



  backendAPIURL = environment.apiBackendUrl+environment.apiFilesDir;
  constructor(
    private responsiveService: ResponsiveService,
    private helpRequestService: HelpRequestService,
    private router: Router
  ) {


    this.responsiveService.checkWidth();
    this.onResize();
  }

  ngOnInit(): void {

    let userDone = JSON.parse(localStorage.getItem('TraggetUser') || '{}');

    this.loggedinUser = userDone;
    if(!userDone && !userDone.full_name){
      this.router.navigate(['/home'])
    }
    // this.fetchHelpTopics();s



  }

  logoutUser(){
    localStorage.removeItem('TraggetUser');
    localStorage.removeItem('TraggetUserPermission');
    sessionStorage.removeItem('TraggetUserSub');
    sessionStorage.removeItem('TraggetUserTrial');
    localStorage.removeItem('Unknown_disp');
    localStorage.removeItem('TraggetUserMenuCounts');

    window.location.href= '/home';
  }

  onResize() {
    this.responsiveService.getMobileStatus().subscribe(screen => {
      // alert(screen)
      this.screen = screen;
    });
  }
  fetchHelpTopics(): void {
    this.helpRequestService.getHelpTopics().subscribe(
      (topics) => {
        const topicIds = topics.map((topic: any) => topic.id);
        this.helpRequestService.getHelpConversations(topicIds).subscribe(
          (conversations) => {
            this.help_topics = topics.map((topic: any) => ({
              ...topic,
              conversations: conversations.filter((conversation: any) => conversation.topic_id === topic.id)
            }));

            // Count unread messages
            this.unreadMessages = this.help_topics
              .flatMap(topic => topic.conversations)
              .filter(conversation => !conversation.is_read).length;
          },
          (error) => console.error('Error fetching conversations:', error)
        );
      },
      (error) => console.error('Error fetching topics:', error)
    );
  }
  markAsRead(conversationId: number): void {
    this.helpRequestService.markConversationAsRead(conversationId).subscribe(
      () => {
        // Update the conversation's `is_read` property locally
        const topic = this.help_topics.find((t: any) => t.id === this.open_conversation);
        if (topic) {
          const conversation = topic.conversations.find((c: any) => c.id === conversationId);
          if (conversation) {
            conversation.is_read = true;
            this.unreadMessages--; // Decrement unread messages counter

          }
        }
      },
      (error) => console.error('Error marking conversation as read:', error)
    );
  }


}
