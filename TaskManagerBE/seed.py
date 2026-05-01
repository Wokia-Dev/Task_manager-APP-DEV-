import random
from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.team import Team, TeamMember
from app.models.task import Task

def seed_data():
    app = create_app()
    with app.app_context():
        print("Cleaning up existing data...")
        # Clear data in order to respect foreign key constraints
        db.session.query(Task).delete()
        db.session.query(TeamMember).delete()
        db.session.query(Team).delete()
        db.session.query(User).delete()
        db.session.commit()

        print("Creating users...")
        # 1. Primary Demo User
        demo_user = User(
            username="demouser",
            email="demo@taskflow.com",
            full_name="Demo User",
            avatar_color="#6C63FF"
        )
        demo_user.set_password("password123")
        db.session.add(demo_user)

        # 2. Additional Mock Users
        users = [demo_user]
        mock_users_data = [
            ("alice_dev", "alice@taskflow.com", "Alice Williams", "#FF6B6B"),
            ("bob_marketing", "bob@taskflow.com", "Bob Johnson", "#4ECDC4"),
            ("charlie_pm", "charlie@taskflow.com", "Charlie Davis", "#FFD93D"),
            ("diana_qa", "diana@taskflow.com", "Diana Prince", "#A29BFE")
        ]

        for username, email, full_name, color in mock_users_data:
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                avatar_color=color
            )
            user.set_password("password123")
            db.session.add(user)
            users.append(user)
        
        db.session.commit()

        print("Creating teams...")
        # 3. Create Teams
        frontend_team = Team(
            name="Frontend Team",
            invite_code="FE-DASH-2024",
            created_by=demo_user.id
        )
        marketing_team = Team(
            name="Marketing Project",
            invite_code="MKT-GLOW-24",
            created_by=users[2].id # Bob
        )
        db.session.add_all([frontend_team, marketing_team])
        db.session.commit()

        # 4. Add Members to Teams
        # Frontend: Demo, Alice, Diana
        memberships = [
            TeamMember(team_id=frontend_team.id, user_id=demo_user.id, role='owner'),
            TeamMember(team_id=frontend_team.id, user_id=users[1].id, role='member'), # Alice
            TeamMember(team_id=frontend_team.id, user_id=users[4].id, role='member'), # Diana
            # Marketing: Bob, Demo, Charlie
            TeamMember(team_id=marketing_team.id, user_id=users[2].id, role='owner'), # Bob
            TeamMember(team_id=marketing_team.id, user_id=demo_user.id, role='member'),
            TeamMember(team_id=marketing_team.id, user_id=users[3].id, role='member'), # Charlie
        ]
        db.session.add_all(memberships)
        db.session.commit()

        print("Generating tasks...")
        # 5. Create 20 Tasks with varied data
        task_titles = [
            "Setup Tailwind configuration", "Implement Login screen", "Design landing page hero",
            "Optimize database queries", "Fix navigation glitch", "Refactor Auth service",
            "Create Social Media assets", "Draft Q3 Marketing plan", "Run user testing session",
            "Update README documentation", "Fix CSS layout regressions", "Prepare Sprint demo",
            "Configure CI/CD pipeline", "Research competitor UI", "Audit accessibility",
            "Scale image microservice", "Draft team holiday schedule", "Cleanup legacy components",
            "Update package dependencies", "Implement Dark Mode support"
        ]

        statuses = ['todo', 'in_progress', 'completed']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        today = datetime.utcnow().date()
        
        for i in range(20):
            team = random.choice([frontend_team, marketing_team])
            # Get members for this team to assign correctly
            team_member_ids = [m.user_id for m in team.members.all()]
            
            # Randomly decide if assigned or unassigned
            assigned_to = random.choice(team_member_ids) if random.random() > 0.15 else None
            
            # Random due date logic
            r = random.random()
            if r < 0.2: # Overdue
                due_date = today - timedelta(days=random.randint(1, 10))
            elif r < 0.4: # Today
                due_date = today
            else: # Future
                due_date = today + timedelta(days=random.randint(1, 14))

            status = random.choice(statuses)
            
            task = Task(
                team_id=team.id,
                title=task_titles[i],
                description=f"Automated mock description for task {i+1}. Focus on core deliverables and quality.",
                status=status,
                priority=random.choice(priorities),
                due_date=due_date,
                created_by=random.choice(team_member_ids),
                assigned_to=assigned_to,
                completed_at=datetime.utcnow() if status == 'completed' else None
            )
            db.session.add(task)

        db.session.commit()
        print(f"Successfully seeded database with {len(users)} users, 2 teams, and 20 tasks!")

if __name__ == "__main__":
    seed_data()
