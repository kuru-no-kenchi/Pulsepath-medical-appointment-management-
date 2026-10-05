import API from "@/lib/axios";

export const appointmentService = {
  getAvailableSlots: async (
    doctorId: string,
    date: string,
  ): Promise<string[]> => {
    const response = await API.get<string[]>(
      `/availability/${doctorId}`,
      {
        params: { date },
      },
    );

    return response.data;
  },
};
