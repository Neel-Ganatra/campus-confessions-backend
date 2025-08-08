import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed the database with sample confessions
 */
async function main() {
  try {
    console.log("🌱 Starting database seed...");

    // Sample confessions data
    const sampleConfessions = [
      {
        content:
          "I've been pretending to understand calculus for the entire semester. I'm completely lost but too embarrassed to ask for help. The professor thinks I'm smart because I nod a lot 😭",
        college: "MIT",
        fire: 234,
        heart: 456,
        skull: 123,
        cry: 678,
      },
      {
        content:
          "I have a huge crush on my study group partner but I'm too shy to say anything. We've been studying together for months and I think about them constantly 💕",
        college: "Stanford",
        fire: 890,
        heart: 1560,
        skull: 34,
        cry: 234,
      },
      {
        content:
          "I accidentally submitted my grocery list instead of my essay. The list included 'beer', 'condoms', and 'ice cream for crying'. The professor hasn't graded it yet and I'm PANICKING 💀",
        college: "IIT",
        fire: 2340,
        heart: 670,
        skull: 1450,
        cry: 1230,
      },
      {
        content:
          "I've been living off energy drinks and instant noodles for 3 weeks straight. My body is basically 70% caffeine at this point. Send help (or real food) 🔥",
        college: "MIT",
        fire: 450,
        heart: 230,
        skull: 670,
        cry: 890,
      },
      {
        content:
          "I told my parents I'm studying engineering but I'm actually majoring in art history. Graduation is in 2 months and I don't know how to break it to them 😰",
        college: "Stanford",
        fire: 123,
        heart: 89,
        skull: 456,
        cry: 789,
      },
      {
        content:
          "I've been using the same pen for 2 years and I'm weirdly attached to it. I refuse to use any other pen even though it's running out of ink. My friends think I'm crazy 🖊️",
        college: "Harvard",
        fire: 567,
        heart: 890,
        skull: 123,
        cry: 234,
      },
      {
        content:
          "I have a secret Instagram account where I post aesthetic photos of my campus life. My real account is just memes and chaos. No one knows about my aesthetic side 📸",
        college: "Berkeley",
        fire: 789,
        heart: 1234,
        skull: 56,
        cry: 345,
      },
      {
        content:
          "I've been secretly feeding the campus cats for months. They now follow me to class and wait outside my dorm. I'm basically a cat whisperer now 🐱",
        college: "MIT",
        fire: 1234,
        heart: 2345,
        skull: 67,
        cry: 456,
      },
      {
        content:
          "I accidentally sent a text meant for my crush to my professor. It said 'I can't stop thinking about you' with a heart emoji. I'm considering dropping out 😅",
        college: "Stanford",
        fire: 2345,
        heart: 3456,
        skull: 789,
        cry: 1234,
      },
      {
        content:
          "I've been using the library's 3D printer to make tiny figurines of my professors. I have a whole collection hidden in my dorm. Is this weird? 🤔",
        college: "IIT",
        fire: 456,
        heart: 789,
        skull: 234,
        cry: 567,
      },
      {
        content:
          "I have a crush on the barista at the campus coffee shop. I go there every day even though I don't like coffee. I just order hot water and pretend to study ☕",
        college: "Harvard",
        fire: 678,
        heart: 1234,
        skull: 123,
        cry: 456,
      },
      {
        content:
          "I've been secretly practicing my dance moves in the empty lecture halls at night. I'm preparing for a talent show but no one knows I can dance 💃",
        college: "Berkeley",
        fire: 890,
        heart: 1456,
        skull: 234,
        cry: 678,
      },
      {
        content:
          "I accidentally left my phone in the library and someone found it. They texted my mom saying 'I'm fine, just studying late' and my mom was so proud. I feel guilty 😔",
        college: "MIT",
        fire: 567,
        heart: 890,
        skull: 345,
        cry: 789,
      },
      {
        content:
          "I have a secret TikTok account where I make educational videos about my major. It has 50k followers but my friends and family have no idea. I'm living a double life 📚",
        college: "Stanford",
        fire: 1234,
        heart: 2345,
        skull: 456,
        cry: 890,
      },
      {
        content:
          "I've been collecting all the lost items I find on campus. I have a whole box of single gloves, scarves, and random keys. I'm basically a campus detective 🕵️",
        college: "IIT",
        fire: 345,
        heart: 678,
        skull: 123,
        cry: 456,
      },
    ];

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.report.deleteMany();
    await prisma.confession.deleteMany();

    // Insert sample confessions
    console.log("📝 Inserting sample confessions...");
    for (const confession of sampleConfessions) {
      await prisma.confession.create({
        data: {
          content: confession.content,
          college: confession.college,
          fire: confession.fire,
          heart: confession.heart,
          skull: confession.skull,
          cry: confession.cry,
          createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ), // Random date within last week
        },
      });
    }

    // Insert some sample reports
    console.log("📋 Inserting sample reports...");
    const confessions = await prisma.confession.findMany();

    if (confessions.length > 0) {
      const sampleReports = [
        {
          confessionId: confessions[0].id,
          reason: "Inappropriate content",
        },
        {
          confessionId: confessions[1].id,
          reason: "Spam",
        },
        {
          confessionId: confessions[2].id,
          reason: "Harassment",
        },
      ];

      for (const report of sampleReports) {
        await prisma.report.create({
          data: report,
        });
      }
    }

    console.log("✅ Database seeded successfully!");
    console.log(`📊 Created ${sampleConfessions.length} confessions`);
    console.log("📋 Created 3 sample reports");

    // Display some stats
    const totalConfessions = await prisma.confession.count();
    const totalReactions = await prisma.confession.aggregate({
      _sum: {
        fire: true,
        heart: true,
        skull: true,
        cry: true,
      },
    });

    const totalReactionCount =
      (totalReactions._sum.fire || 0) +
      (totalReactions._sum.heart || 0) +
      (totalReactions._sum.skull || 0) +
      (totalReactions._sum.cry || 0);

    console.log(`📈 Total confessions: ${totalConfessions}`);
    console.log(`🔥 Total reactions: ${totalReactionCount}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("🎉 Seed completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  });
