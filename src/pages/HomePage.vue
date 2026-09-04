<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import HeroSection from '@/components/sections/Hero/HeroSection.vue'

import { publicApi } from '@/services/publicApi'
import { useFetch } from '@/composables/UseFetch'
import AboutSection from '@/components/sections/About/AboutSection.vue'
import StatisticSection from '@/components/UI/StatisticSection.vue'
import VisionMissionSection from '@/components/sections/VisionMission/VisionMissionSection.vue'
import VideoProfile from '@/components/sections/About/VideoProfile.vue'
import MajorSection from '@/components/sections/Major/MajorSection.vue'
import EventSection from '@/components/sections/Event/EventSection.vue'
import NewsSection from '@/components/sections/News/NewsSection.vue'
import VotingSection from '@/components/sections/Voting/VotingSection.vue'
import FeedbackSection from '@/components/sections/Feedback/FeedbackSection.vue'
import Footer from '@/components/layout/Footer.vue'

const { data: banners } = useFetch(publicApi.getBanners)
const { data: about } = useFetch(publicApi.getAbout)
const { data: visionMission } = useFetch(publicApi.getVisionMission)
const { data: majors } = useFetch(publicApi.getMajors)
const { data: events } = useFetch(publicApi.getEvents)
const { data: news } = useFetch(publicApi.getNews)
const { data: votings } = useFetch(publicApi.getVoting)
const { data: feedbackCategories } = useFetch(publicApi.getFeedbackCategories
)
const { data: footer } = useFetch(publicApi.getFooter)

</script>

<template>
  <Navbar />

  <HeroSection
    :banners="banners"
    :about="about"
  />
  <AboutSection 
    :about="about"
    />
   <VisionMissionSection
    :visionMission="visionMission"
    />
    <StatisticSection />
    <VideoProfile
    :about="about" />
    <MajorSection
    :majors="majors" />
    <EventSection
    :events="events" />
    <NewsSection
  :news="news" />
  <VotingSection
  :votings="votings"
/>
<FeedbackSection 
:categories="feedbackCategories" />

    <Footer
    v-if="footer"
    :footer="footer"
    :majors="majors" />
</template>