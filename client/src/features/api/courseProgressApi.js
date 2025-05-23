import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import server from "../../environment.js";


const COURSE_PROGRESS_API = `${server}/api/v1/progress`;   //host 

// const COURSE_PROGRESS_API = "http://localhost:8080/api/v1/progress";   //real localhost

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({baseUrl: COURSE_PROGRESS_API, credentials: "include",}),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({url: `/${courseId}`,method: "GET",
      })}),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({ url: `/${courseId}/lecture/${lectureId}/view`, method:"POST"
      })}),

    completeCourse: builder.mutation({
        query:(courseId) => ({url:`/${courseId}/complete`,method:"POST"
        })}),
    inCompleteCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/incomplete`,
            method:"POST"
        })})}),
});
export const {
useGetCourseProgressQuery,
useUpdateLectureProgressMutation,
useCompleteCourseMutation,
useInCompleteCourseMutation
} = courseProgressApi;
